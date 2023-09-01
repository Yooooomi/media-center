import { FQuery } from "../../../framework/query";
import { QueryHandler } from "../../../framework/queryHandler";
import { TmdbId } from "../../tmdb/domain/tmdbId";
import { TorrentRequest } from "../domain/torrentRequest";
import { TorrentRequestStore } from "./torrentRequest.store";

console.log("HERE");
export class GetTorrentRequestsQuery extends FQuery([TorrentRequest]) {
  constructor(public readonly tmdbId: TmdbId) {
    super();
  }
}

export class GetTorrentRequestsQueryHandler extends QueryHandler<GetTorrentRequestsQuery> {
  constructor(private readonly torrentRequestStore: TorrentRequestStore) {
    super();
  }

  async execute(query: GetTorrentRequestsQuery) {
    const torrents = await this.torrentRequestStore.loadByTmdbId(query.tmdbId);

    return torrents;
  }
}
