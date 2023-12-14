import { ProcessEnvironmentHelper } from "../domains/environment/infrastructure/process.environmentHelper";
import * as fs from "fs";
import * as path from "path";
import {
  Id,
  InMemoryStore,
  Serializer,
  useLog,
} from "@media-center/domain-driven";

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
