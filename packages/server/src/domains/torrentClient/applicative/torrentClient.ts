import { TorrentClientEntry } from "../domain/torrentClientEntry";

export abstract class TorrentClient {
  abstract download(buffer: Buffer, isShow: boolean): Promise<void>;
  abstract getState(): Promise<TorrentClientEntry[]>;
}
