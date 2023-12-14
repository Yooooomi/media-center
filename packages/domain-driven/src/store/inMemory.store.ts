import { Id } from "../id";
import { Serializer, Serialized } from "../serialization";
import { Store } from "./store";

export class InMemoryStore<M, I extends Id> implements Store<M, I> {
  constructor(public readonly serializer: Serializer<M, I>) {}

  store: Record<string, Serialized<M, I>> = {};

  async load(id: I) {
    const value = this.store[id.toString()];
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
      Object.values(this.store).map(
        this.serializer.deserializeModel.bind(this.serializer)
      )
    );
  }

  async save(model: M) {
    this.store[this.serializer.getIdFromModel(model).toString()] =
      await this.serializer.serializeModel(model);
  }

  async delete(id: Id) {
    delete this.store[id.toString()];
  }

  protected async filter(predicate: (item: M) => boolean) {
    const all = await this.loadAll();
    return Promise.all(all.filter(predicate));
  }
}
