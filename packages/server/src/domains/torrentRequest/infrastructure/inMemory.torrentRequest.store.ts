import {
  InMemoryStore,
  SerializableSerializer,
} from "@media-center/domain-driven";
import { TmdbId } from "../../tmdb/domain/tmdbId";
import { TorrentRequestStore } from "../applicative/torrentRequest.store";
import { TorrentRequest } from "../domain/torrentRequest";

export class InMemoryTorrentRequestStore
  extends InMemoryStore<TorrentRequest>
  implements TorrentRequestStore
{
  constructor() {
    super(new SerializableSerializer(TorrentRequest));
  }

  async loadByTmdbId(tmdbId: TmdbId): Promise<TorrentRequest[]> {
    return this.filter((t) => t.tmdbId.equals(tmdbId));
  }
}
