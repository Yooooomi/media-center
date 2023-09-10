import { Query, QueryHandler } from "../../../framework/query";
import { Movie } from "../domain/movie";
import { TmdbAPI } from "./tmdb.api";

export class DiscoverMovieQuery extends Query({
  returningMany: Movie,
}) {}

export class DiscoverMovieQueryHandler extends QueryHandler(
  DiscoverMovieQuery
) {
  constructor(private readonly tmdbApi: TmdbAPI) {
    super();
  }

  async execute(query: DiscoverMovieQuery) {
    const movies = await this.tmdbApi.discoverMovie();
    return movies;
  }
}
