import { ApplicativeError } from "../../../framework/error";
import { Query, QueryHandler } from "../../../framework/query";
import { Shape } from "../../../framework/shape";
import { TmdbStore } from "../../tmdb/applicative/tmdb.store";
import { TmdbId } from "../../tmdb/domain/tmdbId";
import { TorrentIndexerResult } from "../domain/torrentIndexerResult";
import { TorrentIndexer } from "./torrentIndexer";

export class SearchTorrentsQuery extends Query({
  needing: Shape({
    tmdbId: TmdbId,
  }),
  returningMany: TorrentIndexerResult,
}) {}

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
    const tmdbResult = await this.tmdbStore.load(query.data.tmdbId);

    if (!tmdbResult) {
      throw new UnknownTmdb(query.data.tmdbId);
    }
    const results = await this.torrentIndexer.search(tmdbResult.title);

    return results;
  }
}
