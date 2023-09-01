import { Store } from "../../../framework/store";
import { TmdbId } from "../../tmdb/domain/tmdbId";
import { TorrentRequest } from "../domain/torrentRequest";
import { TorrentRequestId } from "../domain/torrentRequestId";

export abstract class TorrentRequestStore extends Store<
  TorrentRequest,
  TorrentRequestId
> {
  abstract loadByTmdbId(tmdbId: TmdbId): Promise<TorrentRequest[]>;
}
