import * as fs from "fs";
import { GetAsset } from "@media-center/domains/src/miscellaneous/tools/meta";
import { TorrentIndexer } from "@media-center/domains/src/torrentIndexer/applicative/torrentIndexer";
import { TorrentIndexerResult } from "@media-center/domains/src/torrentIndexer/domain/torrentIndexerResult";
import { TorrentIndexerResultId } from "@media-center/domains/src/torrentIndexer/domain/torrentIndexerResultId";

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
