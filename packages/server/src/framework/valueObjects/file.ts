import { Shape } from "../shape";

function customBasename(filePath: string): string {
  const parts = filePath.split("/");
  const lastPart = parts[parts.length - 1]!;
  return lastPart;
}

export class File extends Shape({
  path: String,
}) {
  equals(other: unknown) {
    return other instanceof File && this.data.path === other.data.path;
  }

  getFilename() {
    return customBasename(this.data.path);
  }
}

File.register();
