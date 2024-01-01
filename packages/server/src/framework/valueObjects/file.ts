import { Shape } from "@media-center/domain-driven";
import * as path from "path";

export class File extends Shape({
  path: String,
}) {
  equals(other: unknown) {
    return other instanceof File && this.path === other.path;
  }

  getFilename() {
    return path.parse(this.path).name;
  }
}
