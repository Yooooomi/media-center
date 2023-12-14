import { serializeShape, deserializeShape } from "./shape";
import { ShapeParameter } from "./shapeParameter";
import { LiteralInstance } from "./types";

export type ShapeDetails<I, O> = {
  isDetail: true;
  serialize: (input: I) => O;
  deserialize: (serialized: O) => I;
};

export type ShapeDetailsInput<T extends ShapeDetails<any, any>> =
  T extends ShapeDetails<infer I, any> ? I : never;
export type ShapeDetailsOutput<T extends ShapeDetails<any, any>> =
  T extends ShapeDetails<any, infer O> ? O : never;

export function Either<T extends ShapeParameter[]>(
  ...parameters: T
): ShapeDetails<LiteralInstance<T[number]>, [number, any]> {
  return {
    isDetail: true,
    serialize: (input) => {
      const ctorIndex = parameters.findIndex((c) => input.constructor === c);
      const ctor = parameters[ctorIndex];
      if (ctorIndex < 0 || !ctor) {
        throw new Error("Cannot serialize either");
      }
      return [ctorIndex, serializeShape(ctor, input)];
    },
    deserialize: (serialized) => {
      const [ctorIndex, serializedValue] = serialized;
      const ctor = parameters[ctorIndex];
      if (!ctor) {
        throw new Error("Cannot deserialize either");
      }
      return deserializeShape(ctor, serializedValue);
    },
  };
}

export function Optional<T extends ShapeParameter>(
  parameter: T
): ShapeDetails<LiteralInstance<T> | undefined, any> {
  return {
    isDetail: true,
    serialize: (input) => {
      if (input) {
        return serializeShape(parameter, input);
      }
      return undefined;
    },
    deserialize: (serialized) => {
      if (serialized) {
        return deserializeShape(parameter, serialized);
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

export function Multiple<T extends ShapeParameter>(
  parameter: T
): ShapeDetails<LiteralInstance<T>[], any[]> {
  return {
    isDetail: true,
    serialize: (input) => input.map((i) => serializeShape(parameter, i)),
    deserialize: (serialized) =>
      serialized.map((s) => deserializeShape(parameter, s)),
  };
}

export function Dict<T extends Record<string, ShapeParameter>>(
  parameter: T
): ShapeDetails<
  { [k in keyof T]: LiteralInstance<T[k]> },
  { [k in keyof T]: LiteralInstance<T[k]> }
> {
  return {
    isDetail: true,
    serialize: (input) =>
      Object.entries(parameter).reduce<T>((acc, [key, v]) => {
        acc[key as keyof T] = serializeShape(v, input[key]);
        return acc;
      }, {} as any) as any,
    deserialize: (serialized) =>
      Object.entries(parameter).reduce<T>((acc, [key, v]) => {
        acc[key as keyof T] = deserializeShape(v, serialized[key]);
        return acc;
      }, {} as any) as any,
  };
}
