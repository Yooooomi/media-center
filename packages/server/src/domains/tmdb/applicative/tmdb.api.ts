import { AnyTmdb } from "../domain/anyTmdb";
import { Movie } from "../domain/movie";
import { Show } from "../domain/show";
import { TmdbId, TmdbIdType } from "../domain/tmdbId";

export abstract class TmdbAPI {
  abstract get(tmdbId: TmdbId): Promise<AnyTmdb | undefined>;
  abstract search(
    query: string,
    options?: {
      media?: TmdbIdType;
      year?: number;
    }
  ): Promise<AnyTmdb[]>;
  abstract discoverMovie(): Promise<Movie[]>;
  abstract discoverShow(): Promise<Show[]>;
}
