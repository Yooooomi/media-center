import { Id } from "../id";
import { Serializer, Serialized, AtLeastId } from "../serialization";
import { Store } from "./store";

export class InMemoryStore<M extends AtLeastId> implements Store<M> {
  constructor(public readonly serializer: Serializer<M>) {}

  store: Record<string, Serialized<M>> = {};

  async load(id: M["id"]) {
    const value = this.store[id.toString()];
    if (!value) {
      return undefined;
    }
    return this.serializer.deserializeModel(value);
  }

  async loadMany(ids: M["id"][]) {
    return this.filter((f) => ids.some((i) => i.equals(f.id)));
  }

  async loadAll() {
    return Promise.all(
      Object.values(this.store).map(
        this.serializer.deserializeModel.bind(this.serializer)
      )
    );
  }

  async save(model: M) {
    this.store[model.id.toString()] = await this.serializer.serializeModel(
      model
    );
  }

  async delete(id: Id) {
    delete this.store[id.toString()];
  }

  protected async filter(predicate: (item: M) => boolean) {
    const all = await this.loadAll();
    return Promise.all(all.filter(predicate));
  }
}
