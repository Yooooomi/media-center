import { AnyTmdb } from "../domain/anyTmdb";
import { Movie } from "../domain/movie";
import { MovieDetails } from "../domain/movieDetails";
import { Show } from "../domain/show";
import { ShowEpisode } from "../domain/showEpisode";
import { ShowSeason } from "../domain/showSeason";
import { TmdbId, TmdbIdType } from "../domain/tmdbId";

export abstract class TmdbAPI {
  abstract get(tmdbId: TmdbId): Promise<AnyTmdb | undefined>;
  abstract getSeasons(tmdbId: TmdbId): Promise<ShowSeason[]>;
  abstract getEpisodes(
    tmdbId: TmdbId,
    seasonNumber: number
  ): Promise<ShowEpisode[]>;
  abstract searchMovies(query: string, year?: number): Promise<AnyTmdb[]>;
  abstract searchShows(query: string, year?: number): Promise<AnyTmdb[]>;
  abstract discoverMovie(): Promise<Movie[]>;
  abstract discoverShow(): Promise<Show[]>;
  abstract getMovieDetails(tmdbId: TmdbId): Promise<MovieDetails | undefined>;

  async search(
    query: string,
    options?: {
      year?: number;
      type?: TmdbIdType;
    }
  ) {
    if (options?.type === "movie") {
      return this.searchMovies(query, options.year);
    } else if (options?.type === "show") {
      return this.searchShows(query, options.year);
    }
    return (
      await Promise.all([
        this.searchMovies(query, options?.year),
        this.searchShows(query, options?.year),
      ])
    ).flat();
  }
}
