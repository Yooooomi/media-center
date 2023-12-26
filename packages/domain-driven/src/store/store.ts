import { AtLeastId } from "../serialization";

export abstract class Store<M extends AtLeastId> {
  abstract load(id: M["id"]): Promise<M | undefined>;
  abstract loadMany(ids: M["id"][]): Promise<M[]>;
  abstract loadAll(): Promise<M[]>;
  abstract save(model: M): Promise<void>;
  abstract delete(id: M["id"]): Promise<void>;
}
