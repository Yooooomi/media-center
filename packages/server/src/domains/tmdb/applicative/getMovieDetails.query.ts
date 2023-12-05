import { ApplicativeError } from "../../../framework/error";
import { Query, QueryHandler } from "../../../framework/query";
import { Shape } from "../../../framework/shape";
import { MovieDetails } from "../domain/movieDetails";
import { TmdbId } from "../domain/tmdbId";
import { TmdbAPI } from "./tmdb.api";

export class GetMovieDetailsQuery extends Query({
  needing: Shape({
    tmdbId: TmdbId,
  }),
  returning: MovieDetails,
}) {}

class DetailsNotFound extends ApplicativeError {
  constructor(tmdbId: TmdbId) {
    super(`Could not find details for tmdb id: ${tmdbId.toString()}`);
  }
}

export class GetMovieDetailsQueryHandler extends QueryHandler(
  GetMovieDetailsQuery
) {
  constructor(private readonly tmdbApi: TmdbAPI) {
    super();
  }

  public async execute(query: GetMovieDetailsQuery) {
    const details = await this.tmdbApi.getMovieDetails(query.data.tmdbId);

    if (!details) {
      throw new DetailsNotFound(query.data.tmdbId);
    }

    return details;
  }
}
