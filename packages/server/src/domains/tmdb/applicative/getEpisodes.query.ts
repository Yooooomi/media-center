import { Query, QueryHandler } from "../../../framework/query";
import { Multiple, Shape } from "../../../framework/shape";
import { ShowEpisode } from "../domain/showEpisode";
import { TmdbId } from "../domain/tmdbId";
import { TmdbAPI } from "./tmdb.api";

export class GetEpisodesQuery extends Query({
  needing: Shape({
    tmdbId: TmdbId,
    seasonNumber: Number,
  }),
  returning: Multiple(ShowEpisode),
}) {}

export class GetEpisodesQueryHandler extends QueryHandler(GetEpisodesQuery) {
  constructor(private readonly tmdbApi: TmdbAPI) {
    super();
  }

  public async execute(query: GetEpisodesQuery) {
    const episodes = await this.tmdbApi.getEpisodes(
      query.data.tmdbId,
      query.data.seasonNumber
    );

    return episodes;
  }
}
