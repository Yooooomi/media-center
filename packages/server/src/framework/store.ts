import { ProcessEnvironmentHelper } from "../domains/environment/infrastructure/process.environmentHelper";
import { Id } from "./id";
import { Serialized, Serializer } from "./serializer";
import * as fs from "fs";
import * as path from "path";
import { useLog } from "./useLog";

export abstract class Store<M, I extends Id> {
  abstract load(id: I): Promise<M | undefined>;
  abstract loadMany(ids: I[]): Promise<M[]>;
  abstract loadAll(): Promise<M[]>;
  abstract save(model: M): Promise<void>;
  abstract delete(id: I): Promise<void>;
}

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

export class FilesystemStore<M, I extends Id> extends InMemoryStore<M, I> {
  private readonly location: string;

  constructor(serializer: Serializer<M, I>) {
    super(serializer);
    const env = new ProcessEnvironmentHelper();
    this.location = env.get("FILESYSTEM_STORE_DIR");
    const logger = useLog(this.constructor.name);
    try {
      const filename = path.join(this.location, this.constructor.name);
      this.store = JSON.parse(fs.readFileSync(filename).toString());
      logger.info(`Initialized with ${Object.keys(this.store).length} entries`);
    } catch (e) {
      logger.warn("Could not initialize database, using empty one");
      this.store = {};
    }
  }

  commit<T extends FilesystemStore<any, any>>(this: T) {
    const filename = path.join(this.location, this.constructor.name);
    fs.writeFileSync(filename, JSON.stringify(this.store));
  }

  async save(model: M) {
    await super.save(model);
    this.commit();
  }

  async delete(id: Id) {
    await super.delete(id);
    this.commit();
  }
}
