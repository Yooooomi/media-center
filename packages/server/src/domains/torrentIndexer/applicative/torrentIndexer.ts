import { TorrentIndexerResult } from "../domain/torrentIndexerResult";
import { TorrentIndexerResultId } from "../domain/torrentIndexerResultId";

// The implemented methods should throw if anything goes wrong
export abstract class TorrentIndexer {
  abstract ensureAccessToDownload(): Promise<void>;
  abstract search(query: string): Promise<TorrentIndexerResult[]>;
  abstract download(torrentId: TorrentIndexerResultId): Promise<Buffer>;
}
