import { Query, Either, QueryHandler } from "@media-center/domain-driven";
import { Movie } from "../domain/movie";
import { Show } from "../domain/show";
import { TmdbId } from "../domain/tmdbId";
import { TmdbStore } from "./tmdb.store";

export class GetTmdbsQuery extends Query([TmdbId], [Either(Movie, Show)]) {}

export class GetTmdbsQueryHandler extends QueryHandler(GetTmdbsQuery) {
  constructor(private readonly tmdbStore: TmdbStore) {
    super();
  }

  public async execute(query: GetTmdbsQuery) {
    const tmdbs = await this.tmdbStore.loadMany(query.value);

    return tmdbs;
  }
}
