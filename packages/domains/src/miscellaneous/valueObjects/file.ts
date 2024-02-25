import * as path from "path";
import { Shape } from "@media-center/domain-driven";

export class File extends Shape({
  path: String,
}) {
  equals(other: unknown) {
    return other instanceof File && this.path === other.path;
  }

  getFilenameWithExtension() {
    const parts = this.path.split(path.sep);
    const lastPart = parts[parts.length - 1];
    return lastPart ?? "";
  }

  getFilename() {
    return path.parse(this.path).name;
  }
}
