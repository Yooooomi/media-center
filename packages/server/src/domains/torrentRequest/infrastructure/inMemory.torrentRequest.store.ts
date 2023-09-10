import { ShapeSerializer } from "../../../framework/shape";
import { InMemoryStore } from "../../../framework/store";
import { TmdbId } from "../../tmdb/domain/tmdbId";
import { TorrentRequestStore } from "../applicative/torrentRequest.store";
import { TorrentRequest } from "../domain/torrentRequest";
import { TorrentRequestId } from "../domain/torrentRequestId";

export class InMemoryTorrentRequestStore
  extends InMemoryStore<TorrentRequest, TorrentRequestId>
  implements TorrentRequestStore
{
  constructor() {
    super(new ShapeSerializer(TorrentRequest));
  }

  async loadByTmdbId(tmdbId: TmdbId): Promise<TorrentRequest[]> {
    return this.filter((t) => t.tmdbId.equals(tmdbId));
  }
}
