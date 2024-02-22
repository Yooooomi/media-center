import * as fs from "fs";
import * as path from "path";
import { EnvironmentHelper } from "@media-center/domains/src/environment/applicative/environmentHelper";

abstract class EndpointCaching {
  abstract get(key: string): Promise<fs.ReadStream | undefined>;
  abstract set(key: string, buffer: Buffer): Promise<void>;
}

export class FilesystemEndpointCaching extends EndpointCaching {
  private dirpath: string;

  constructor(environmentHelper: EnvironmentHelper) {
    super();
    this.dirpath = path.join(
      environmentHelper.get("FILESYSTEM_STORE_DIR"),
      "endpoints",
    );
    if (!fs.existsSync(this.dirpath)) {
      fs.mkdirSync(this.dirpath);
    }
  }

  private getFilepathFromKey(key: string) {
    const filepath = path.join(this.dirpath, key);
    return filepath;
  }

  async get(key: string) {
    const filepath = this.getFilepathFromKey(key);
    if (!fs.existsSync(filepath)) {
      return undefined;
    }
    return fs.createReadStream(filepath);
  }

  async set(key: string, buffer: Buffer) {
    const filepath = this.getFilepathFromKey(key);
    fs.writeFileSync(filepath, buffer);
  }
}
