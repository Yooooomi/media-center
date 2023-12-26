import { Definition } from "./definition";
import { SerializableClassConfiguration } from "./serializableClass";

export type EitherConfiguration<T> = SerializableClassConfiguration<T>[];
export type EitherDefinition<C extends EitherConfiguration<any>> = Definition<
  InstanceType<C[number]>,
  [number, ReturnType<InstanceType<C[number]>["serialize"]>]
>;
export function Either<C extends EitherConfiguration<any>>(
  ...configuration: C
): EitherDefinition<C> {
  return {
    paramToRuntime: (param) => param,
    serialize: (runtime) => {
      const index = configuration.findIndex((c) => runtime.constructor === c);
      const ctor = configuration[index];
      if (!ctor) {
        throw new Error(
          `Cannot serialize either of type ${runtime.constructor}`
        );
      }
      return [index, runtime.serialize()] as any;
    },
    deserialize: (serialized) => {
      const index = serialized[0];
      const dataSerialized = serialized[1];
      const ctor = configuration[index];
      if (!ctor) {
        throw new Error(`Cannot deserialize either at index ${index}`);
      }
      return ctor.deserialize(dataSerialized);
    },
  };
}
