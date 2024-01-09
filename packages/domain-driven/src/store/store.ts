import { AtLeastId, Constructor } from "../serialization";

export type Transaction = any;

export type Database = any;

export abstract class Store<M extends AtLeastId> {
  abstract load(id: M["id"], transaction?: Transaction): Promise<M | undefined>;
  abstract loadMany(ids: M["id"][], transaction?: Transaction): Promise<M[]>;
  abstract loadAll(transaction?: Transaction): Promise<M[]>;
  abstract save(model: M, transaction?: Transaction): Promise<void>;
  abstract delete(id: M["id"], transaction?: Transaction): Promise<void>;
  abstract deleteAll(transaction?: Transaction): Promise<void>;
  abstract countAll(transaction?: Transaction): Promise<number>;
}

export abstract class TransactionPerformer<
  T extends Transaction = Transaction
> {
  abstract transactionnally<R>(
    executor: (transaction: T) => Promise<R>
  ): Promise<R>;
}
