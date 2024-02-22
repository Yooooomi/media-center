import {
  Query,
  ApplicativeError,
  QueryHandler,
} from "@media-center/domain-driven";
import { MovieDetails } from "../domain/movieDetails";
import { TmdbId } from "../domain/tmdbId";
import { TmdbAPI } from "./tmdb.api";

export class GetMovieDetailsQuery extends Query(
  {
    tmdbId: TmdbId,
  },
  MovieDetails,
) {}

class DetailsNotFound extends ApplicativeError {
  constructor(tmdbId: TmdbId) {
    super(`Could not find details for tmdb id: ${tmdbId.toString()}`);
  }
}

export class GetMovieDetailsQueryHandler extends QueryHandler(
  GetMovieDetailsQuery,
) {
  constructor(private readonly tmdbApi: TmdbAPI) {
    super();
  }

  public async execute(query: GetMovieDetailsQuery) {
    const details = await this.tmdbApi.getMovieDetails(query.tmdbId);

    if (!details) {
      throw new DetailsNotFound(query.tmdbId);
    }

    return details;
  }
}
