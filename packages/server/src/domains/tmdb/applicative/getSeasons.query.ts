import { Query, QueryHandler } from "../../../framework/query";
import { Multiple, Shape } from "../../../framework/shape";
import { ShowSeason } from "../domain/showSeason";
import { TmdbId } from "../domain/tmdbId";
import { TmdbAPI } from "./tmdb.api";

export class GetSeasonsQuery extends Query({
  needing: Shape({
    tmdbId: TmdbId,
  }),
  returning: Multiple(ShowSeason),
}) {}

export class GetSeasonsQueryHandler extends QueryHandler(GetSeasonsQuery) {
  constructor(private readonly tmdbApi: TmdbAPI) {
    super();
  }

  public async execute(query: GetSeasonsQuery) {
    const seasons = await this.tmdbApi.getSeasons(query.data.tmdbId);

    return seasons;
  }
}
