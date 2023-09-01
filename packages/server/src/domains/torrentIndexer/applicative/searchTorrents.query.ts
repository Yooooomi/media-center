import { ApplicativeError } from "../../../framework/error";
import { Query } from "../../../framework/query";
import { QueryHandler } from "../../../framework/queryHandler";
import { TmdbStore } from "../../tmdb/applicative/tmdb.store";
import { TmdbId } from "../../tmdb/domain/tmdbId";
import { TorrentIndexerResult } from "../domain/torrentIndexerResult";
import { TorrentIndexer } from "./torrentIndexer";

export class SearchTorrentsQuery extends Query<TorrentIndexerResult[]> {
  constructor(public readonly tmdbId: TmdbId) {
    super();
  }
}

class UnknownTmdb extends ApplicativeError {
  constructor(tmdbId: TmdbId) {
    super(`Tmdb with id ${tmdbId.toString()} was not found`);
  }
}

export class SearchTorrentsQueryHandler extends QueryHandler<SearchTorrentsQuery> {
  constructor(
    private readonly tmdbStore: TmdbStore,
    private readonly torrentIndexer: TorrentIndexer
  ) {
    super();
  }

  async execute(query: SearchTorrentsQuery) {
    const tmdbResult = await this.tmdbStore.load(query.tmdbId);

    if (!tmdbResult) {
      throw new UnknownTmdb(query.tmdbId);
    }
    const results = await this.torrentIndexer.search(tmdbResult.title);

    return results;
  }
}
