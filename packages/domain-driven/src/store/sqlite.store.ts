import { Database } from "better-sqlite3";
import { AtLeastId, Serializer } from "../serialization";
import { PromiseQueue } from "../queue";
import { Store, TransactionPerformer } from "./store";

const sqliteQueue = new PromiseQueue(0);
const singleton: { currentTransaction: number | undefined } = {
  currentTransaction: undefined,
};

interface SQLiteTransaction {
  id: number;
}

export class SQLiteStore<M extends AtLeastId> implements Store<M> {
  constructor(
    private readonly database: Database,
    private readonly collectionName: string,
    private readonly serializer: Serializer<M>,
  ) {
    database.exec(`
      CREATE TABLE IF NOT EXISTS ${collectionName} (
        id TEXT PRIMARY KEY,
        data JSON NOT NULL
      )
    `);
  }

  private run<R>(
    run: (database: Database) => R,
    transaction: SQLiteTransaction | undefined,
  ) {
    if (!transaction) {
      return sqliteQueue.queue(async () => run(this.database));
    }
    if (singleton.currentTransaction !== transaction.id) {
      throw new Error("Transaction corruption");
    }
    return run(this.database);
  }

  protected async _select(
    query: string,
    transaction: SQLiteTransaction | undefined,
    ...args: any[]
  ): Promise<M[]> {
    const documents = await this.run(
      (database) =>
        database
          .prepare(`SELECT * FROM ${this.collectionName} ${query}`)
          .all(...args),
      transaction,
    );
    return Promise.all(
      documents.map((e: any) =>
        this.serializer.deserializeModel({ id: e.id, ...JSON.parse(e.data) }),
      ),
    );
  }

  protected _count(
    query: string,
    transaction: SQLiteTransaction | undefined,
    ...args: any[]
  ) {
    return this.run(
      (database) =>
        database
          .prepare(
            `SELECT COUNT(*) AS count FROM ${this.collectionName} ${query}`,
          )
          .get(...args) as any,
      transaction,
    ).count as number;
  }

  protected _delete(
    query: string,
    transaction: SQLiteTransaction | undefined,
    ...args: any[]
  ): any {
    return this.run(
      (database) =>
        database
          .prepare(`DELETE FROM ${this.collectionName} ${query}`)
          .run(...args),
      transaction,
    );
  }

  async load(id: M["id"], transaction?: SQLiteTransaction) {
    const [document] = await this._select(
      "WHERE id = ?",
      transaction,
      id.toString(),
    );
    return document;
  }

  async loadMany(ids: M["id"][], transaction?: SQLiteTransaction) {
    return this._select(
      `WHERE id IN (${ids.map(() => "?").join(", ")})`,
      transaction,
      ...ids.map((e) => e.toString()),
    );
  }

  async loadAll(transaction?: SQLiteTransaction) {
    return this._select("", transaction);
  }

  async save(model: M, transaction?: SQLiteTransaction) {
    const serialized = await this.serializer.serializeModel(model);
    const id = model.id.toString();
    delete serialized.id;
    await this.run(
      (database) =>
        database
          .prepare(
            `INSERT OR REPLACE INTO ${this.collectionName} (id, data) VALUES (?, json(?))`,
          )
          .run(id, JSON.stringify(serialized)),
      transaction,
    );
  }

  async delete(id: M["id"], transaction?: SQLiteTransaction) {
    await this._delete("WHERE id = ?", transaction, id.toString());
  }

  async deleteAll(transaction?: SQLiteTransaction) {
    await this._delete("", transaction);
  }

  async countAll(transaction?: SQLiteTransaction) {
    return this._count("", transaction);
  }
}

export class SQLiteTransactionPerformer extends TransactionPerformer<any> {
  constructor(private readonly database: Database) {
    super();
  }

  static id = 0;

  async transactionnally<R>(
    executor: (transaction: SQLiteTransaction) => Promise<R>,
  ): Promise<R> {
    return await sqliteQueue.queue(async () => {
      const id = SQLiteTransactionPerformer.id++;
      singleton.currentTransaction = id;
      this.database.exec("BEGIN");
      console.log("Beginning transaction");
      const result = await executor({ id });
      console.log("Ended transaction");
      this.database.exec("COMMIT");
      return result;
    });
  }
}
