import { AtLeastId } from "../serialization";
import { InMemoryTransaction } from "./inMemory.store";

export abstract class Store<M extends AtLeastId> {
  abstract transactionnally<T>(
    executor: (transaction: InMemoryTransaction) => Promise<T>
  ): Promise<T>;
  abstract load(
    id: M["id"],
    transaction?: InMemoryTransaction
  ): Promise<M | undefined>;
  abstract loadMany(
    ids: M["id"][],
    transaction?: InMemoryTransaction
  ): Promise<M[]>;
  abstract loadAll(transaction?: InMemoryTransaction): Promise<M[]>;
  abstract save(model: M, transaction?: InMemoryTransaction): Promise<void>;
  abstract delete(
    id: M["id"],
    transaction?: InMemoryTransaction
  ): Promise<void>;
}
