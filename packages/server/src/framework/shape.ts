import { Constructor } from "../types/utils";
import { Id } from "./id";
import { Serializer } from "./serializer";

class Parent {
  private __unique__!: string;
}

export abstract class AutoSerialize<Expected> {
  private readonly markUsed!: Expected;
  static isShape = true;

  static serialize(..._args: any[]) {}
  static deserialize(_value: any) {
    throw new Error("Not implemented");
  }

  serialize(this: any) {
    return this.constructor.serialize(this);
  }
}

export type AutoSerializeConstructor<E> = Constructor<AutoSerialize<E>> & {
  serialize(...args: any[]): E;
  deserialize(...args: any[]): E;
};

const implemented = [
  String.prototype,
  Boolean.prototype,
  Number.prototype,
  AutoSerialize.prototype,
] as const;
type Implemented = (typeof implemented)[number];

type Instance<T> = T extends Constructor<infer K> ? K : never;
export type LiteralInstance<T> = T extends Constructor<String>
  ? string
  : T extends Constructor<Number>
  ? number
  : T extends Constructor<Boolean>
  ? boolean
  : Instance<T>;

export type ManifestToRecord<T> = T extends Record<infer K extends string, any>
  ? {
      [k in K]: T[k] extends Constructor<AutoSerialize<infer E>>
        ? E extends Parent
          ? Instance<T[k]>
          : E
        : LiteralInstance<T[k]>;
    }
  : never;

function serialize(ctor: Constructor<any>, value: any) {
  if (ctor === String || ctor === Number || ctor === Boolean) {
    return value;
  }
  if ((ctor as any).isShape === true) {
    return (ctor as any).serialize(value);
  }
}

function deserialize(ctor: Constructor<any>, value: any) {
  if (ctor === String || ctor === Number || ctor === Boolean) {
    return value;
  }
  if ((ctor as any).isShape === true) {
    return (ctor as any).deserialize(value);
  }
}

export function Shape<M extends Record<string, any>>(manifest: M) {
  class A extends AutoSerialize<Parent> {
    manifest!: M;

    constructor(data: ManifestToRecord<M>) {
      super();
      Object.assign(this, data);
    }

    static serialize(value: A) {
      return Object.entries(manifest).reduce<Record<string, any>>(
        (acc, [key, auto]) => {
          acc[key] = serialize(auto, (value as any)[key]);
          return acc;
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

  return A as any as new (data: ManifestToRecord<M>) => A & ManifestToRecord<M>;
}

export function Multiple<T extends Constructor<Implemented>[]>(...ctors: T) {
  class A extends AutoSerialize<Instance<T[number]>[]> {
    static serialize(value: Instance<T[number]>[]) {
      return value.map((v) => {
        const autoIndex = ctors.findIndex((c) => c === v.constructor);
        const auto = ctors[autoIndex];

        if (autoIndex < 0 || !auto) {
          throw new Error("Using not referenced constructor");
        }

        return [autoIndex, serialize(auto, v)];
      });
    }

    static deserialize(value: any) {
      return (value as [number, any][]).map(([ctorIndex, value]) => {
        const auto = ctors[ctorIndex];

        if (!auto) {
          throw new Error("Serialized but cannot find used constructor");
        }

        return deserialize(auto, value);
      });
    }
  }
  return A;
}

export function Enum<T extends readonly string[]>(values: T) {
  class A extends AutoSerialize<T[number]> {
    static serialize(value: T[number]) {
      return value;
    }

    static deserialize<T extends Constructor<any>>(this: T, value: any) {
      return value;
    }
  }

  return A;
}

export function Optional<T extends Implemented>(ctor: Constructor<T>) {
  class A extends AutoSerialize<LiteralInstance<Constructor<T>> | undefined> {
    static serialize(value: Instance<T> | undefined) {
      if (!value) {
        return undefined;
      }
      return serialize(ctor, value);
    }

    static deserialize(value: any): void {
      if (!value) {
        return undefined;
      }
      return deserialize(ctor, value);
    }
  }
  return A;
}

export function Literal<T extends any>(ctor: Constructor<T>) {
  class A extends AutoSerialize<Parent> {
    constructor(public readonly value: LiteralInstance<Constructor<T>>) {
      super();
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

export class ShapeSerializer<T> extends Serializer<Instance<T>, any> {
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
    return model.serialize();
  }

  protected async deserialize(serialized: any) {
    return (this.ctor as any).deserialize(serialized);
  }
}
