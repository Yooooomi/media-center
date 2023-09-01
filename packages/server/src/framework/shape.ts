import { Constructor, Instance } from "../types/utils";
import { InfrastructureError } from "./error";
import { Id } from "./id";
import { Serializer } from "./serializer";

type LiteralInstance<T extends Constructor<any>> = T extends Constructor<Number>
  ? number
  : T extends Constructor<String>
  ? string
  : T extends Constructor<Boolean>
  ? boolean
  : Instance<T>;
type Instances<R extends Record<any, Constructor<any> | [Constructor<any>]>> = {
  [k in keyof R]: R[k] extends Constructor<any>
    ? LiteralInstance<R[k]>
    : R[k] extends [Constructor<any>]
    ? LiteralInstance<R[k]["0"]>[]
    : never;
};

class CannotSerialize extends InfrastructureError {
  constructor(ctor: Constructor<any>, propertyName: string) {
    super(`Property "${propertyName}" of "${ctor.name}" cannot be serialized`);
  }
}

class CannotDeserialize extends InfrastructureError {
  constructor(name: string, data: any) {
    super(
      `Cannot deserialize "${name}" (data: ${JSON.stringify(
        data
      )}), you maybe forget to Shape.Register() your shape`
    );
  }
}

type IShapeConstrcutor = Constructor<IShape<any>> & {
  hash: string;
  manifest: Record<string, Constructor<any> | [Constructor<any>]>;
};

export class IShape<
  R extends Record<string, Constructor<any> | [Constructor<any>]>
> {
  static isShape = true;
  static manifest: Record<string, Constructor<any> | [Constructor<any>]>;

  static computeHash(
    ctor: IShapeConstrcutor,
    manifest: Record<string, Constructor<any> | [Constructor<any>]>
  ) {
    const manifestHash = Object.entries(manifest)
      .map(([key, ctor]) => {
        const unwrapped = Array.isArray(ctor) ? ctor[0] : ctor;
        return `${key}:${unwrapped.name}`;
      })
      .join(",");
    return `${ctor.name}=${manifestHash}`;
  }

  constructor(public data: Instances<R>) {}

  serialize<T extends IShape<any>>(this: T) {
    const serialized = Object.entries(
      (this.constructor as IShapeConstrcutor).manifest
    ).reduce<Record<string, any>>((acc, [key, ctor]) => {
      function getValue(v: any) {
        if (v instanceof IShape) {
          return v.serialize();
        } else if (
          typeof v === "string" ||
          typeof v === "number" ||
          typeof v === "boolean" ||
          typeof v === "undefined" ||
          v === null
        ) {
          return v;
        } else if (v instanceof Id) {
          return v.toString();
        } else {
          throw new CannotSerialize(v.constructor, key);
        }
      }

      const value = this.data[key];
      if (Array.isArray(value)) {
        acc[key] = value.map(getValue);
      } else {
        acc[key] = getValue(value);
      }

      return acc;
    }, {});

    return {
      ...serialized,
      hash: (this.constructor as IShapeConstrcutor).hash,
    };
  }

  private static registry = new Map<
    string,
    { ctor: Constructor<IShape<any>>; manifest: any }
  >();

  static register<T extends IShapeConstrcutor>(this: T) {
    this.hash = IShape.computeHash(this, this.manifest);
    IShape.registry.set(this.hash, {
      ctor: this,
      manifest: this.manifest,
    });
  }

  static deserialize<T extends IShapeConstrcutor | Constructor<IShape<any>>>(
    this: T,
    name: string,
    data: any
  ) {
    const entry = IShape.registry.get(name);
    if (!entry) {
      throw new CannotDeserialize(name, data);
    }
    return new entry.ctor(
      Object.entries(entry.manifest).reduce<any>((acc, [key, ctor]) => {
        const value = data[key];
        const unwrapped = Array.isArray(ctor) ? ctor[0] : ctor;

        function getValue(value: any) {
          if (
            unwrapped === String ||
            unwrapped === Number ||
            unwrapped === Boolean
          ) {
            return value;
          } else if (unwrapped.isShape) {
            return IShape.deserialize(unwrapped.hash, value);
          } else {
            return new unwrapped(value);
          }
        }

        if (Array.isArray(value)) {
          acc[key] = value.map(getValue);
        } else {
          acc[key] = getValue(value);
        }

        return acc;
      }, {})
    ) as Instance<T>;
  }
}

export function Shape<
  R extends Record<string, Constructor<any> | [Constructor<any>]>
>(manifest: R) {
  const clss = class extends IShape<R> {
    static hash = "";
    static manifest = manifest;
  };
  return clss;
}

export class ShapeSerializer<
  I extends Id,
  T extends IShape<{ id: Constructor<I> }>
> extends Serializer<T, I> {
  public version = 0;

  public getIdFromModel(model: T): I {
    return model.data.id as I;
  }

  protected async serialize(model: T) {
    return model.serialize();
  }

  protected async deserialize(serialized: any) {
    return IShape.deserialize(serialized.hash, serialized) as T;
  }
}
