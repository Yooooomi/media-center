import { Constructor } from "./shape";

export type Serializable = { serialize(): any };
export type SerializableConstructor<T> = Constructor<T> & {
  deserialize(serialized: any): any;
};
