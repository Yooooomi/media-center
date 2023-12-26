import {
  Query,
  ApplicativeError,
  QueryHandler,
} from "@media-center/domain-driven";
import { TmdbStore } from "../../tmdb/applicative/tmdb.store";
import { TmdbId } from "../../tmdb/domain/tmdbId";
import { TorrentIndexerResult } from "../domain/torrentIndexerResult";
import { TorrentIndexer } from "./torrentIndexer";

export class SearchTorrentsQuery extends Query(
  {
    query: String,
  },
  [TorrentIndexerResult]
) {}

class UnknownTmdb extends ApplicativeError {
  constructor(tmdbId: TmdbId) {
    super(`Tmdb with id ${tmdbId.toString()} was not found`);
  }
}

export class SearchTorrentsQueryHandler extends QueryHandler(
  SearchTorrentsQuery
) {
  constructor(
    private readonly tmdbStore: TmdbStore,
    private readonly torrentIndexer: TorrentIndexer
  ) {
    super();
  }

  async execute(query: SearchTorrentsQuery) {
    const results = await this.torrentIndexer.search(query.data.query);

    return results;
  }
}
