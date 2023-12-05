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
  abstract search(
    query: string,
    options?: {
      media?: TmdbIdType;
      year?: number;
    }
  ): Promise<AnyTmdb[]>;
  abstract discoverMovie(): Promise<Movie[]>;
  abstract discoverShow(): Promise<Show[]>;
  abstract getMovieDetails(tmdbId: TmdbId): Promise<MovieDetails | undefined>;
}
