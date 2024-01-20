import { TorrentClientEntry } from "../domain/torrentClientEntry";

// The implemented methods should throw if anything wrong happens
export abstract class TorrentClient {
  abstract download(buffer: Buffer, isShow: boolean): Promise<void>;
  abstract delete(hash: string): Promise<void>;
  abstract getState(): Promise<TorrentClientEntry[]>;
}
