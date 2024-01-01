import { Id } from "../id";
import { Serializable } from "./types";

type AdditionalSerialized = { id: string; version: number };

export interface AtLeastId {
  id: {
    toString(): string;
    equals(other: any): boolean;
  };
}

export abstract class Serializer<M extends AtLeastId> {
  public abstract get version(): number;

  protected abstract serialize(model: M): Promise<any>;
  protected abstract deserialize(
    serialized: Awaited<ReturnType<Serializer<M>["serialize"]>>,
    version: number
  ): Promise<M>;

  public async serializeModel(model: M) {
    return {
      ...(await this.serialize(model)),
      version: this.version,
    };
  }

  public async deserializeModel(
    serialized: Awaited<ReturnType<Serializer<M>["serialize"]>> &
      AdditionalSerialized
  ) {
    return await this.deserialize(serialized, serialized.version);
  }
}

export type Serialized<M extends AtLeastId> = Awaited<
  ReturnType<Serializer<M>["serializeModel"]>
>;
export type S<A> = A & AdditionalSerialized;
export type Deserialized<S> = S extends Serializer<infer K> ? K : never;

export class SerializableSerializer<
  M extends AtLeastId & Serializable
> extends Serializer<M> {
  constructor(
    private readonly ctor: {
      deserialize(serialized: any): M;
      serialize(runtime: M): any;
    }
  ) {
    super();
  }

  public get version(): number {
    return 1;
  }

  protected async serialize(model: M) {
    return await this.ctor.serialize(model);
  }

  protected async deserialize(serialized: any, version: number) {
    return await this.ctor.deserialize(serialized);
  }
}
