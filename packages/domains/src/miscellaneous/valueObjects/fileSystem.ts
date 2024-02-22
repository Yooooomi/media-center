import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { File } from "./file";

export abstract class Filesystem {
  abstract pipe(filename: string): Promise<{ stream: WStream; file: File }>;
  abstract write(filename: string, content: Buffer): Promise<File>;
  abstract delete(file: File): Promise<void>;
}

export type RStream = fs.ReadStream;
export type WStream = fs.WriteStream;

export class DiskFilesystem extends Filesystem {
  async write(filename: string, content: Buffer) {
    const filepath = path.join(os.tmpdir(), filename);
    fs.writeFileSync(filepath, content);
    return new File({
      path: filepath,
    });
  }

  async delete(file: File) {
    fs.unlinkSync(file.path);
  }

  async pipe(filename: string) {
    const createdStream = fs.createWriteStream(filename);
    return { stream: createdStream, file: new File({ path: filename }) };
  }
}
