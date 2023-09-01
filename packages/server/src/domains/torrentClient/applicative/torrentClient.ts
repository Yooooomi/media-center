import { TorrentRequest } from "../../torrentRequest/domain/torrentRequest";

export abstract class TorrentClient {
  abstract download(buffer: Buffer): Promise<void>;
  abstract getState(): Promise<TorrentRequest[]>;
}
