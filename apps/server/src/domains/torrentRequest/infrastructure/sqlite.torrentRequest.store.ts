import {
  Database,
  SQLiteStore,
  SerializableSerializer,
} from "@media-center/domain-driven";
import { TmdbId } from "@media-center/domains/src/tmdb/domain/tmdbId";
import { TorrentRequestStore } from "@media-center/domains/src/torrentRequest/applicative/torrentRequest.store";
import { TorrentRequest } from "@media-center/domains/src/torrentRequest/domain/torrentRequest";

export class SQLiteTorrentRequestStore
  extends SQLiteStore<TorrentRequest>
  implements TorrentRequestStore
{
  constructor(database: Database) {
    super(
      database,
      "torrentRequest",
      new SerializableSerializer(TorrentRequest),
    );
  }

  async loadByTmdbId(tmdbId: TmdbId): Promise<TorrentRequest[]> {
    return this._select(
      "WHERE json_extract(data, '$.tmdbId') = ?",
      undefined,
      tmdbId.toString(),
    );
  }
}
