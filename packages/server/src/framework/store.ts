import * as path from "path";
import * as fs from "fs";
import {
  AtLeastId,
  FilesystemStore as DDFilesystemStore,
  InMemoryDatabase,
  Serializer,
} from "@media-center/domain-driven";
import { EnvironmentHelper } from "../domains/environment/applicative/environmentHelper";

export class FilesystemStore<M extends AtLeastId> extends DDFilesystemStore<M> {
  constructor(
    environmentHelper: EnvironmentHelper,
    database: InMemoryDatabase,
    collectionName: string,
    serializer: Serializer<M>
  ) {
    const dir = environmentHelper.get("FILESYSTEM_STORE_DIR");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    const filepath = path.join(dir, collectionName);
    super(filepath, database, collectionName, serializer);
  }
}
