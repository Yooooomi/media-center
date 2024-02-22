import { Query, QueryHandler } from "@media-center/domain-driven";
import { ShowSeason } from "../domain/showSeason";
import { TmdbId } from "../domain/tmdbId";
import { TmdbAPI } from "./tmdb.api";

export class GetSeasonsQuery extends Query(
  {
    tmdbId: TmdbId,
  },
  [ShowSeason]
) {}

export class GetSeasonsQueryHandler extends QueryHandler(GetSeasonsQuery) {
  constructor(private readonly tmdbApi: TmdbAPI) {
    super();
  }

  public async execute(query: GetSeasonsQuery) {
    const seasons = await this.tmdbApi.getSeasons(query.tmdbId);

    return seasons;
  }
}
