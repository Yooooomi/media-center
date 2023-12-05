import { Constructor } from "../types/utils";
import { Serializer } from "./serializer";
import { useLog } from "./useLog";

export abstract class AutoSerialize<M> {
  static isShape = true;

  static serialize(..._args: any[]) {}
  static deserialize(_value: any) {
    throw new Error("Not implemented");
  }

  serialize(this: any) {
    return this.constructor.serialize(this);
  }

  constructor(public readonly manifest: M) {}
}

export type ShapeParameter =
  | Constructor<String>
  | Constructor<Number>
  | Constructor<Boolean>
  | Constructor<Date>
  | Constructor<AutoSerialize<any>>
  | ShapeDetails<any, any>;

type Instance<T> = T extends Constructor<infer K> ? K : never;
export type LiteralInstance<T> = T extends Constructor<String>
  ? string
  : T extends Constructor<Number>
  ? number
  : T extends Constructor<Boolean>
  ? boolean
  : T extends Constructor<Date>
  ? Date
  : T extends Constructor<infer K>
  ? K
  : T extends ShapeDetails<infer L, any>
  ? L
  : never;

export type ManifestToInput<T> = T extends Record<infer K extends string, any>
  ? {
      [k in K]: T[k] extends AutoSerialize<infer M>
        ? ManifestToInput<M>
        : T[k] extends ShapeDetails<infer I, any>
        ? I
        : LiteralInstance<T[k]>;
    }
  : never;

export type DetailsInput<T> = T extends Constructor<AutoSerialize<infer M>>
  ? ManifestToInput<M>
  : T extends ShapeDetails<infer I, any>
  ? LiteralInstance<T>
  : void;

function serialize(ctor: ShapeParameter, value: any) {
  if (ctor === String || ctor === Number || ctor === Boolean) {
    return value;
  }
  if (ctor === Date) {
    return (value as Date).toISOString();
  }
  if ((ctor as any).isDetail === true) {
    return (ctor as any).serialize(value);
  }
  if ((ctor as any).isShape === true) {
    return (ctor as any).serialize(value);
  }
}

function deserialize(ctor: ShapeParameter, value: any) {
  if (ctor === String || ctor === Number || ctor === Boolean) {
    return value;
  }
  if (ctor === Date) {
    return new Date(value);
  }
  if ((ctor as any).isDetail === true) {
    return (ctor as any).deserialize(value);
  }
  if ((ctor as any).isShape === true) {
    return (ctor as any).deserialize(value);
  }
}

const logger = useLog(Shape.constructor.name);

export function Shape<M extends Record<string, any>>(manifest: M) {
  class A extends AutoSerialize<M> {
    constructor(data: ManifestToInput<M>) {
      super(manifest);
      Object.assign(this, data);
    }

    static serialize<T extends Constructor<any>>(this: T, value: A) {
      return Object.entries(manifest).reduce<Record<string, any>>(
        (acc, [key, auto]) => {
          try {
            acc[key] = serialize(auto, (value as any)[key]);
            return acc;
          } catch (e) {
            logger.warn(
              `Error while serializing ${this.name} key ${key} of ${value}, expected constructor ${auto}`
            );
            throw e;
          }
        },
        {}
      );
    }

    static deserialize<T extends Constructor<A>>(this: T, value: any): any {
      return new this(
        Object.entries(manifest).reduce<Record<string, any>>(
          (acc, [key, auto]) => {
            acc[key] = deserialize(auto, value[key]);
            return acc;
          },
          {}
        )
      );
    }
  }

  return A as any as new (data: ManifestToInput<M>) => A & ManifestToInput<M>;
}

export function Literal<T extends any>(ctor: Constructor<T>) {
  class A extends AutoSerialize<any> {
    constructor(public readonly value: LiteralInstance<Constructor<T>>) {
      super(null);
    }

    static serialize(value: A) {
      return value.value;
    }

    static deserialize<C extends Constructor<any>>(this: C, value: T) {
      return new this(value);
    }
  }
  return A;
}

export type ShapeDetails<I, O> = {
  isDetail: true;
  serialize: (input: I) => O;
  deserialize: (serialized: O) => I;
};

export function Multiple<T extends ShapeParameter>(
  ctor: T
): ShapeDetails<LiteralInstance<T>[], any[]> {
  return {
    isDetail: true,
    serialize: (input) => input.map((i) => serialize(ctor, i)),
    deserialize: (serialized) => serialized.map((s) => deserialize(ctor, s)),
  };
}

export function Either<T extends ShapeParameter[]>(
  ...ctors: T
): ShapeDetails<LiteralInstance<T[number]>, [number, any]> {
  return {
    isDetail: true,
    serialize: (input) => {
      const ctorIndex = ctors.findIndex((c) => input.constructor === c);
      const ctor = ctors[ctorIndex];
      if (ctorIndex < 0 || !ctor) {
        throw new Error("Cannot serialize either");
      }
      return [ctorIndex, serialize(ctor, input)];
    },
    deserialize: (serialized) => {
      const [ctorIndex, serializedValue] = serialized;
      const ctor = ctors[ctorIndex];
      if (!ctor) {
        throw new Error("Cannot deserialize either");
      }
      return deserialize(ctor, serializedValue);
    },
  };
}

export function Optional<T extends ShapeParameter>(
  ctor: T
): ShapeDetails<LiteralInstance<T> | undefined, any> {
  return {
    isDetail: true,
    serialize: (input) => {
      if (input) {
        return serialize(ctor, input);
      }
      return undefined;
    },
    deserialize: (serialized) => {
      if (serialized) {
        return deserialize(ctor, serialized);
      }
      return undefined;
    },
  };
}

export function Enum<T extends string>(values: T[]): ShapeDetails<T, string> {
  return {
    isDetail: true,
    serialize: (input) => input,
    deserialize: (serialized) => serialized as T,
  };
}

export class ShapeSerializer<T extends ShapeParameter> extends Serializer<
  Instance<T>,
  any
> {
  constructor(private readonly ctor: T) {
    super();
  }

  public get version() {
    return 1;
  }

  public getIdFromModel(model: any) {
    return model.id;
  }

  protected async serialize(model: any) {
    return { data: serialize(this.ctor, model) };
  }

  protected async deserialize(serialized: any) {
    return deserialize(this.ctor, serialized.data);
  }
}
