import { compact, wait } from "@media-center/algorithm";
import { Serializer, AtLeastId } from "../serialization";
import { Database, Store, TransactionPerformer } from "./store";
import * as fs from "fs";

interface Document {
  updatedAt: number;
  data: any;
}

interface ReadOperation {
  type: "read";
  collectionName: string;
  id: string;
  updatedAt: number | undefined;
}
interface WriteOperation {
  type: "write";
  collectionName: string;
  id: string;
  data: any;
}
interface DeleteOperation {
  type: "delete";
  collectionName: string;
  id: string;
}

type Operation = ReadOperation | WriteOperation | DeleteOperation;

class TransactionCollision extends Error {
  constructor() {
    super("Collision when running transaction");
  }
}

class TooManyTransactionRetries extends Error {
  constructor() {
    super("Retried transaction too many times");
  }
}

class CannotReadAfterWrites extends Error {
  constructor() {
    super("Cannot read after writes in transaction");
  }
}

export class InMemoryTransaction {
  public operations: Operation[] = [];
  private hasWrote = false;

  markRead(collectionName: string, id: string, updatedAt: number | undefined) {
    if (this.hasWrote) {
      throw new CannotReadAfterWrites();
    }
    this.operations.push({ collectionName, type: "read", id, updatedAt });
  }

  markWritten(collectionName: string, id: string, data: any) {
    this.hasWrote = true;
    this.operations.push({ collectionName, type: "write", id, data });
  }

  markDeleted(collectionName: string, id: string) {
    this.hasWrote = true;
    this.operations.push({ collectionName, type: "delete", id });
  }
}

class Collection {
  private readonly onWrites: (() => void)[] = [];

  constructor(private readonly name: string) {}

  protected storage: Record<string, Document> = {};

  public setStorage(storage: Record<string, Document>) {
    this.storage = storage;
  }

  public getStorage() {
    return this.storage;
  }

  private written() {
    this.onWrites.forEach((onWrite) => onWrite());
  }

  public onWrite(onWrite: () => void) {
    this.onWrites.push(onWrite);
  }

  public read(id: string, transaction?: InMemoryTransaction) {
    const document = this.storage[id];
    transaction?.markRead(this.name, id, document?.updatedAt);
    return document;
  }

  public write(id: string, data: any, transaction?: InMemoryTransaction) {
    if (transaction) {
      transaction.markWritten(this.name, id, data);
    } else {
      this.storage[id] = { updatedAt: Date.now(), data };
      this.written();
    }
  }

  public delete(id: string, transaction?: InMemoryTransaction) {
    if (transaction) {
      transaction.markDeleted(this.name, id);
    } else {
      delete this.storage[id.toString()];
      this.written();
    }
  }

  public deleteAll(transaction?: InMemoryTransaction) {
    return Object.keys(this.storage).forEach((id) => {
      this.delete(id, transaction);
    });
  }

  public readAll(transaction?: InMemoryTransaction) {
    return Object.entries(this.storage).map(([id, value]) => {
      transaction?.markRead(this.name, id, value.updatedAt);
      return value;
    });
  }

  public async filter<T>(
    predicate: (item: Document) => Promise<T | undefined>,
    transaction?: InMemoryTransaction
  ) {
    return compact(
      await Promise.all(
        Object.entries(this.storage).map(async ([id, value]) => {
          const shouldKeep = await predicate(value);
          if (shouldKeep) {
            transaction?.markRead(this.name, id, value.updatedAt);
          }
          return shouldKeep;
        })
      )
    );
  }
}

export class InMemoryDatabase implements Database {
  protected readonly collections: Record<string, Collection> = {};

  public getCollection(name: string) {
    const collection = this.collections[name] ?? new Collection(name);
    this.collections[name] = collection;
    return collection;
  }

  public getTransactionPerformer() {
    return new InMemoryTransactionPerformer(this);
  }

  static waits = [
    0, 0, 0, 0, 0, 100, 100, 100, 100, 500, 500, 1000, 1000, 5000,
  ];

  public async transactionnally<T>(
    executor: (transaction: InMemoryTransaction) => Promise<T>
  ): Promise<T> {
    let tries = 0;
    while (true) {
      try {
        const transaction = new InMemoryTransaction();
        const result = await executor(transaction);
        for (const operation of transaction.operations) {
          if (operation.type === "read") {
            const item = this.getCollection(operation.collectionName).read(
              operation.id
            );
            if (item?.updatedAt !== operation.updatedAt) {
              throw new TransactionCollision();
            }
            continue;
          }
          if (operation.type === "write") {
            this.getCollection(operation.collectionName).write(
              operation.id,
              operation.data
            );
          }
          if (operation.type === "delete") {
            this.getCollection(operation.collectionName).delete(operation.id);
          }
        }
        return result;
      } catch (e) {
        if (e instanceof TransactionCollision) {
          const thisWait = InMemoryDatabase.waits[tries];
          if (thisWait === undefined) {
            throw new TooManyTransactionRetries();
          }
          await wait(thisWait);
          tries += 1;
          continue;
        }
        throw e;
      }
    }
  }
}

export class InMemoryStore<M extends AtLeastId> implements Store<M> {
  constructor(
    private readonly database: InMemoryDatabase,
    public readonly collectionName: string,
    public readonly serializer: Serializer<M>
  ) {}

  protected collection<T extends InMemoryStore<any>>(this: T) {
    return this.database.getCollection(this.collectionName);
  }

  public transactionnally<T>(
    executor: (transaction: InMemoryTransaction) => Promise<T>
  ) {
    return this.database.transactionnally(executor);
  }

  async load(id: M["id"], transaction?: InMemoryTransaction) {
    const value = this.collection().read(id.toString(), transaction);
    if (!value) {
      return undefined;
    }
    return this.serializer.deserializeModel(value.data);
  }

  async loadMany(ids: M["id"][], transaction?: InMemoryTransaction) {
    const loaded = await this.filter(
      (f) => ids.some((i) => i.equals(f.id)),
      transaction
    );
    return loaded;
  }

  async loadAll(transaction?: InMemoryTransaction) {
    return await Promise.all(
      this.collection()
        .readAll(transaction)
        .map((d) => this.serializer.deserializeModel(d.data))
    );
  }

  async save(model: M, transaction?: InMemoryTransaction) {
    this.collection().write(
      model.id.toString(),
      await this.serializer.serializeModel(model),
      transaction
    );
  }

  async delete(id: M["id"], transaction?: InMemoryTransaction) {
    this.collection().delete(id.toString(), transaction);
  }

  async deleteAll(
    transaction?: InMemoryTransaction | undefined
  ): Promise<void> {
    this.collection().deleteAll(transaction);
  }

  protected async filter(
    predicate: (item: M) => boolean,
    transaction?: InMemoryTransaction
  ) {
    return await this.collection().filter(async (item) => {
      const deserialized = await this.serializer.deserializeModel(item.data);
      const shouldKeep = predicate(deserialized);
      if (shouldKeep) {
        return deserialized;
      }
      return undefined;
    }, transaction);
  }

  async countAll(transaction?: InMemoryTransaction | undefined) {
    return this.collection().readAll(transaction).length;
  }
}

export abstract class FilesystemStore<
  M extends AtLeastId
> extends InMemoryStore<M> {
  constructor(
    protected readonly filepath: string,
    database: InMemoryDatabase,
    collectionName: string,
    serializer: Serializer<M>
  ) {
    super(database, collectionName, serializer);
    this.init();
  }

  init() {
    this.collection().onWrite(this.commit.bind(this));
    try {
      const content = JSON.parse(fs.readFileSync(this.filepath).toString());
      this.collection().setStorage(content);
    } catch (e) {}
  }

  private commit() {
    fs.writeFileSync(
      this.filepath,
      JSON.stringify(this.collection().getStorage())
    );
  }

  async delete(id: M["id"], transaction?: InMemoryTransaction | undefined) {
    await super.delete(id, transaction);
  }

  async deleteAll(
    transaction?: InMemoryTransaction | undefined
  ): Promise<void> {
    await super.deleteAll(transaction);
  }

  async save(model: M, transaction?: InMemoryTransaction) {
    await super.save(model, transaction);
  }
}

export class InMemoryTransactionPerformer extends TransactionPerformer<InMemoryTransaction> {
  constructor(private readonly database: InMemoryDatabase) {
    super();
  }

  async transactionnally<R>(
    executor: (transaction: InMemoryTransaction) => Promise<R>
  ): Promise<R> {
    return await this.database.transactionnally(executor);
  }
}
