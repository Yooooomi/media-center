import { Query, QueryHandler } from "@media-center/domain-driven";
import { TmdbAPI } from "../tmdb/applicative/tmdb.api";
import { Movie } from "../tmdb/domain/movie";
import { Show } from "../tmdb/domain/show";

export class DiscoverPageQuery extends Query(undefined, {
  movies: [Movie],
  shows: [Show],
}) {}

export class DiscoverPageQueryHandler extends QueryHandler(DiscoverPageQuery) {
  constructor(private readonly tmdbApi: TmdbAPI) {
    super();
  }

  async execute() {
    const [movies, shows] = await Promise.all([
      this.tmdbApi.discoverMovie(),
      this.tmdbApi.discoverShow(),
    ]);

    return {
      movies,
      shows,
    };
  }
}
