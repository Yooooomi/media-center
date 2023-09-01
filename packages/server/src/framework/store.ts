import { Id } from "./id";
import { Serialized, Serializer } from "./serializer";

export abstract class Store<M, I extends Id> {
  abstract load(id: I): Promise<M | undefined>;
  abstract loadMany(ids: I[]): Promise<M[]>;
  abstract loadAll(): Promise<M[]>;
  abstract save(model: M): Promise<void>;
  abstract delete(id: I): Promise<void>;
}

export class InMemoryStore<M, I extends Id> implements Store<M, I> {
  constructor(public readonly serializer: Serializer<M, I>) {}

  store: Map<string, Serialized<M, I>> = new Map();

  async load(id: I) {
    const value = this.store.get(id.toString());
    if (!value) {
      return undefined;
    }
    return this.serializer.deserializeModel(value);
  }

  async loadMany(ids: I[]) {
    return this.filter((f) =>
      ids.some((i) => i.equals(this.serializer.getIdFromModel(f)))
    );
  }

  async loadAll() {
    return Promise.all(
      [...this.store.values()].map(
        this.serializer.deserializeModel.bind(this.serializer)
      )
    );
  }

  async save(model: M) {
    this.store.set(
      this.serializer.getIdFromModel(model).toString(),
      await this.serializer.serializeModel(model)
    );
  }

  async delete(id: Id) {
    this.store.delete(id.toString());
  }

  protected async filter(predicate: (item: M) => boolean) {
    const all = await this.loadAll();
    return Promise.all(all.filter(predicate));
  }
}
