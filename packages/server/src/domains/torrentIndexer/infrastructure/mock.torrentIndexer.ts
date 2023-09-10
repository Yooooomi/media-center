import { TorrentIndexer } from "../applicative/torrentIndexer";
import * as fs from "fs";
import * as path from "path";
import { TorrentIndexerResultId } from "../domain/torrentIndexerResultId";
import { TorrentIndexerResult } from "../domain/torrentIndexerResult";
import { Dirname, GetAsset } from "../../../tools/meta";

export class MockTorrentIndexer extends TorrentIndexer {
  constructor() {
    super();
  }

  async search(query: string) {
    return [
      new TorrentIndexerResult({
        id: new TorrentIndexerResultId("id"),
        name: query,
        leechers: 12,
        seeders: 24,
        size: 1024 * 1024 * 24,
        pageUrl: "https://google.com",
      }),
    ];
  }

  async ensureAccessToDownload() {}

  async download() {
    return fs.readFileSync(GetAsset("example.torrent"));
  }
}
