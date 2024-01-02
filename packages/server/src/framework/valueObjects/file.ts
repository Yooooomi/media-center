import { Shape } from "@media-center/domain-driven";
import * as path from "path";

export class File extends Shape({
  path: String,
}) {
  equals(other: unknown) {
    return other instanceof File && this.path === other.path;
  }

  getFilenameWithExtension() {
    const parts = this.path.split("/");
    const lastPart = parts[parts.length - 1];
    return lastPart ?? "";
  }

  getFilename() {
    return path.parse(this.path).name;
  }
}
