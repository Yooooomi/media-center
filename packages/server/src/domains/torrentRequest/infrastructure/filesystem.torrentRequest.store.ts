import {
  InMemoryDatabase,
  SerializableSerializer,
} from "@media-center/domain-driven";
import { TmdbId } from "../../tmdb/domain/tmdbId";
import { TorrentRequestStore } from "../applicative/torrentRequest.store";
import { TorrentRequest } from "../domain/torrentRequest";
import { FilesystemStore } from "../../../framework/store";
import { EnvironmentHelper } from "../../environment/applicative/environmentHelper";

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
