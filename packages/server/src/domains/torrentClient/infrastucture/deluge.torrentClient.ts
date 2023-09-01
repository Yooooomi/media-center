import { TorrentClient } from "../applicative/torrentClient";

export class DelugeTorrentClient extends TorrentClient {
  async getState() {
    return [];
  }
  async download(buffer: Buffer) {}
}
