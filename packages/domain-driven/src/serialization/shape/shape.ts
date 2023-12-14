import { Constructor, Instance } from "../../types";
import { ShapeDetails } from "./shapeDetails";
import { ShapeParameter, switchShapeParameterAndValue } from "./shapeParameter";
import { LiteralInstance } from "./types";
import { ShapeLogger } from "./utils";

export type ShapeClassConstructor<M extends ShapeManifest> = Constructor<
  ShapeClass<M>
> & {
  isShape: true;
  serialize(...args: any[]): any;
  deserialize(value: any): any;
};
export abstract class ShapeClass<M extends ShapeManifest> {
  static isShape = true;

  static serialize(..._args: any[]) {}
  static deserialize(_value: any) {
    throw new Error("Not implemented");
  }

  serialize(this: ShapeClass<M>): SerializedManifest<M> {
    return serializeShape(this.constructor as ShapeParameter, this);
  }

  constructor(public readonly manifest: M) {}
}

export function Shape<M extends ShapeManifest>(manifest: M) {
  class A extends ShapeClass<M> {
    constructor(data: SerializedManifest<M>) {
      super(manifest);
      Object.assign(this, data);
    }

    static manifest = manifest;

    static serialize<T extends Constructor<any>>(this: T, value: A) {
      return Object.entries(manifest).reduce<Record<string, any>>(
        (acc, [key, auto]) => {
          try {
            acc[key] = serializeShape(auto, value as any)[key];
            return acc;
          } catch (e) {
            ShapeLogger.warn(
              `Error while serializing ${this.name} key ${key} of ${value}, expected constructor ${auto}`
            );
            throw e;
          }
        },
        {}
      );
    }

    static deserialize<T extends Constructor<A>>(this: T, value: any) {
      return new this(
        Object.entries(manifest).reduce<Record<string, any>>(
          (acc, [key, auto]) => {
            acc[key] = deserializeShape(auto, value[key]);
            return acc;
          },
          {}
        )
      ) as A & InstantiatedManifest<M>;
    }
  }

  return A as any as (new (data: InstantiatedManifest<M>) => A &
    InstantiatedManifest<M>) & { manifest: M };
}

export function serializeShape(ctor: ShapeParameter, value: any) {
  return switchShapeParameterAndValue(ctor, value, {
    string: (_, value) => value,
    number: (_, value) => value,
    boolean: (_, value) => value,
    date: (_, value) => value.toISOString(),
    details: (constructor, value) => constructor.serialize(value),
    shape: (constructor, value) => constructor.serialize(value),
  });
}

export function deserializeShape(ctor: ShapeParameter, value: any) {
  return switchShapeParameterAndValue(ctor, value, {
    string: (_, value) => value,
    number: (_, value) => value,
    boolean: (_, value) => value,
    date: (_, value) => new Date(value),
    details: (constructor, value) => constructor.deserialize(value),
    shape: (constructor, value) => constructor.deserialize(value),
  });
}

export type ShapeManifest = {
  [x: string]: ShapeParameter;
};

export type SerializedManifest<M extends ShapeManifest> = {
  [k in keyof M]: M[k] extends Constructor<ShapeClass<infer OM>>
    ? SerializedManifest<OM>
    : M[k] extends ShapeDetails<infer I, any>
    ? I
    : LiteralInstance<M[k]>;
};

export type InstantiatedManifest<M extends ShapeManifest> = {
  [k in keyof M]: M[k] extends Constructor<ShapeClass<any>>
    ? Instance<M[k]>
    : M[k] extends ShapeDetails<infer I, any>
    ? I
    : LiteralInstance<M[k]>;
};

export type SerializedShape<T extends ShapeClass<any>> = T extends ShapeClass<
  infer M extends ShapeManifest
>
  ? SerializedManifest<M>
  : never;
