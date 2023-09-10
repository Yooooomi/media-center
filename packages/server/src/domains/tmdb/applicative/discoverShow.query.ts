import { Query, QueryHandler } from "../../../framework/query";
import { Show } from "../domain/show";
import { TmdbAPI } from "./tmdb.api";

export class DiscoverShowQuery extends Query({
  returningMany: Show,
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
