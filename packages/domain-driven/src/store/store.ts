import { Id } from "../id";

export abstract class Store<M, I extends Id> {
  abstract load(id: I): Promise<M | undefined>;
  abstract loadMany(ids: I[]): Promise<M[]>;
  abstract loadAll(): Promise<M[]>;
  abstract save(model: M): Promise<void>;
  abstract delete(id: I): Promise<void>;
}
