import { Definition, DefinitionRuntime } from ".";
import { Id } from "../id";
import { Serializable, SerializableConstructor } from "./types";

type AdditionalSerialized = { id: string; version: number };

export interface AtLeastId {
  id: Id;
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
  constructor(private readonly ctor: SerializableConstructor<M>) {
    super();
  }

  public get version(): number {
    return 1;
  }

  protected serialize(model: M) {
    return model.serialize();
  }

  protected deserialize(serialized: any, version: number): Promise<M> {
    return this.ctor.deserialize(serialized);
  }
}

export class DefinitionSerializer<M extends AtLeastId> extends Serializer<M> {
  constructor(private readonly definition: Definition<M>) {
    super();
  }

  public get version(): number {
    return 1;
  }

  protected async serialize(model: M) {
    return this.definition.serialize(model);
  }

  protected async deserialize(serialized: any, version: number) {
    return this.definition.deserialize(serialized);
  }
}
