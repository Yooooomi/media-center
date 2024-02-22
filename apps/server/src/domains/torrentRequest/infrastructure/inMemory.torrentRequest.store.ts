import {
  InMemoryDatabase,
  InMemoryStore,
  SerializableSerializer,
} from "@media-center/domain-driven";
import { TmdbId } from "@media-center/domains/src/tmdb/domain/tmdbId";
import { TorrentRequestStore } from "@media-center/domains/src/torrentRequest/applicative/torrentRequest.store";
import { TorrentRequest } from "@media-center/domains/src/torrentRequest/domain/torrentRequest";

export class InMemoryTorrentRequestStore
  extends InMemoryStore<TorrentRequest>
  implements TorrentRequestStore
{
  constructor(database: InMemoryDatabase) {
    super(
      database,
      "torrentRequest",
      new SerializableSerializer(TorrentRequest),
    );
  }

  async loadByTmdbId(tmdbId: TmdbId): Promise<TorrentRequest[]> {
    return this.filter((t) => t.tmdbId.equals(tmdbId));
  }
}
