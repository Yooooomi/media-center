import { Query, QueryHandler } from "@media-center/domain-driven";
import { Movie } from "../domains/tmdb/domain/movie";
import { Show } from "../domains/tmdb/domain/show";
import { TmdbAPI } from "../domains/tmdb/applicative/tmdb.api";

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
