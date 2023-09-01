import { Id } from "./id";

type AdditionalSerialized = { id: string; version: number };

export abstract class Serializer<M, I extends Id> {
  public abstract get version(): number;

  public abstract getIdFromModel(model: M): I;
  protected abstract serialize(model: M): Promise<any>;
  protected abstract deserialize(
    serialized: Awaited<ReturnType<Serializer<M, I>["serialize"]>> &
      AdditionalSerialized
  ): Promise<M>;

  public async serializeModel(model: M) {
    return {
      ...(await this.serialize(model)),
      version: this.version,
    };
  }

  public async deserializeModel(
    serialized: Awaited<ReturnType<Serializer<M, I>["serialize"]>> &
      AdditionalSerialized
  ) {
    return await this.deserialize({
      ...serialized,
      version: serialized.version,
    });
  }
}

export type Serialized<M, I extends Id> = Awaited<
  ReturnType<Serializer<M, I>["serializeModel"]>
>;
export type S<A> = A & AdditionalSerialized;
export type Deserialized<S> = S extends Serializer<infer K, any> ? K : never;
