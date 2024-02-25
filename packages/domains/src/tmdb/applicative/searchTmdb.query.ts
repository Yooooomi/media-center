import { Query, Either, QueryHandler } from "@media-center/domain-driven";
import { Movie } from "../domain/movie";
import { Show } from "../domain/show";
import { TmdbAPI } from "./tmdb.api";

export class SearchTmdbQuery extends Query(String, [Either(Show, Movie)]) {}

export class SearchTmdbQueryHandler extends QueryHandler(SearchTmdbQuery) {
  constructor(private readonly tmdbApi: TmdbAPI) {
    super();
  }

  public async execute(query: SearchTmdbQuery) {
    const results = await this.tmdbApi.search(query.value);

    return results;
  }
}
