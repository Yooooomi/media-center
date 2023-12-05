import { Query, QueryHandler } from "../../../framework/query";
import { Either, Multiple } from "../../../framework/shape";
import { Movie } from "../domain/movie";
import { Show } from "../domain/show";
import { TmdbId } from "../domain/tmdbId";
import { TmdbStore } from "./tmdb.store";

export class GetTmdbsQuery extends Query({
  needing: Multiple(TmdbId),
  returning: Multiple(Either(Movie, Show)),
}) {}

export class GetTmdbsQueryHandler extends QueryHandler(GetTmdbsQuery) {
  constructor(private readonly tmdbStore: TmdbStore) {
    super();
  }

  public async execute(query: GetTmdbsQuery) {
    const tmdbs = await this.tmdbStore.loadMany(query.data);

    return tmdbs;
  }
}
