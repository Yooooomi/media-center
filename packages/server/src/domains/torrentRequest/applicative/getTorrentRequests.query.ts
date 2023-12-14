import {
  Query,
  Multiple,
  QueryHandler,
  Dict,
} from "@media-center/domain-driven";
import { TmdbId } from "../../tmdb/domain/tmdbId";
import { TorrentRequest } from "../domain/torrentRequest";
import { TorrentRequestStore } from "./torrentRequest.store";

export class GetTorrentRequestsQuery extends Query({
  needing: Dict({
    tmdbId: TmdbId,
  }),
  returning: Multiple(TorrentRequest),
}) {}

export class GetTorrentRequestsQueryHandler extends QueryHandler(
  GetTorrentRequestsQuery
) {
  constructor(private readonly torrentRequestStore: TorrentRequestStore) {
    super();
  }

  async execute(query: GetTorrentRequestsQuery) {
    const torrents = await this.torrentRequestStore.loadByTmdbId(
      query.data.tmdbId
    );

    return torrents;
  }
}
