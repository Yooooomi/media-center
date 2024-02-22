import {
  InMemoryDatabase,
  SerializableSerializer,
} from "@media-center/domain-driven";
import { EnvironmentHelper } from "@media-center/domains/src/environment/applicative/environmentHelper";
import { TmdbId } from "@media-center/domains/src/tmdb/domain/tmdbId";
import { TorrentRequestStore } from "@media-center/domains/src/torrentRequest/applicative/torrentRequest.store";
import { TorrentRequest } from "@media-center/domains/src/torrentRequest/domain/torrentRequest";
import { FilesystemStore } from "../../../framework/store";

export class FilesystemTorrentRequestStore
  extends FilesystemStore<TorrentRequest>
  implements TorrentRequestStore
{
  constructor(
    environmentHelper: EnvironmentHelper,
    database: InMemoryDatabase
  ) {
    super(
      environmentHelper,
      database,
      "torrentRequest",
      new SerializableSerializer(TorrentRequest)
    );
  }

  async loadByTmdbId(tmdbId: TmdbId): Promise<TorrentRequest[]> {
    return this.filter((t) => t.tmdbId.equals(tmdbId));
  }
}
