import { Store } from "@media-center/domain-driven";
import { TmdbId } from "../../tmdb/domain/tmdbId";
import { TorrentRequest } from "../domain/torrentRequest";
import { TorrentRequestId } from "../domain/torrentRequestId";

export abstract class TorrentRequestStore extends Store<TorrentRequest> {
  abstract loadByTmdbId(tmdbId: TmdbId): Promise<TorrentRequest[]>;
}
