import { Query, Multiple, QueryHandler } from "@media-center/domain-driven";
import { Show } from "../domain/show";
import { TmdbAPI } from "./tmdb.api";

export class DiscoverShowQuery extends Query({
  returning: Multiple(Show),
}) {}

export class DiscoverShowQueryHandler extends QueryHandler(DiscoverShowQuery) {
  constructor(private readonly tmdbApi: TmdbAPI) {
    super();
  }

  async execute(command: DiscoverShowQuery) {
    const shows = await this.tmdbApi.discoverShow();
    return shows;
  }
}
