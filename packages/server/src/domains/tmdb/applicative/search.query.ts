import { Query, QueryHandler } from "../../../framework/query";
import { Either, Multiple, Shape } from "../../../framework/shape";
import { Movie } from "../domain/movie";
import { Show } from "../domain/show";
import { TmdbAPI } from "./tmdb.api";

export class SearchQuery extends Query({
  needing: Shape({
    search: String,
  }),
  returning: Multiple(Either(Show, Movie)),
}) {}

export class SearchQueryHandler extends QueryHandler(SearchQuery) {
  constructor(private readonly tmdbApi: TmdbAPI) {
    super();
  }

  public async execute(query: SearchQuery) {
    const results = await this.tmdbApi.search(query.data.search);

    return results;
  }
}
