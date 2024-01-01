import {
  BaseEvent,
  Query,
  QueryHandler,
  Shape,
} from "@media-center/domain-driven";
import { TmdbId } from "../domains/tmdb/domain/tmdbId";
import { ShowEpisode } from "../domains/tmdb/domain/showEpisode";
import {
  CatalogEntryDeleted,
  CatalogEntryUpdated,
} from "../domains/catalog/applicative/catalog.events";
import { TmdbAPI } from "../domains/tmdb/applicative/tmdb.api";
import { ShowCatalogEntryFulfilled } from "../domains/catalog/applicative/catalogEntryFulfilled.front";
import { getShowCatalogEntryFulfilled } from "./showCatalogEntryFulfilled.service";
import { HierarchyStore } from "../domains/fileWatcher/applicative/hierarchy.store";
import { CatalogEntryStore } from "../domains/catalog/applicative/catalogEntry.store";
import { compact } from "@media-center/algorithm";
import {
  TorrentRequestAdded,
  TorrentRequestUpdated,
} from "../domains/torrentRequest/domain/torrentRequest.events";

class ShowSeasonPageSummary extends Shape({
  episodes: [ShowEpisode],
  shownEpisodes: [Number],
  catalogEntry: ShowCatalogEntryFulfilled,
}) {}

export class GetShowSeasonPageQuery extends Query(
  { id: TmdbId, season: Number },
  ShowSeasonPageSummary
) {}

export class GetShowSeasonPageQueryHandler extends QueryHandler(
  GetShowSeasonPageQuery,
  [
    CatalogEntryUpdated,
    CatalogEntryDeleted,
    TorrentRequestAdded,
    TorrentRequestUpdated,
  ]
) {
  constructor(
    private readonly tmdbApi: TmdbAPI,
    private readonly hierarchyStore: HierarchyStore,
    private readonly catalogEntryStore: CatalogEntryStore
  ) {
    super();
  }

  shouldReact(
    event:
      | CatalogEntryUpdated
      | CatalogEntryDeleted
      | TorrentRequestAdded
      | TorrentRequestUpdated,
    intent: GetShowSeasonPageQuery
  ) {
    if (
      event instanceof TorrentRequestAdded ||
      event instanceof TorrentRequestUpdated
    ) {
      return event.tmdbId.equals(intent.id);
    }
    return event.catalogEntry.id.equals(intent.id);
  }

  async execute(intent: GetShowSeasonPageQuery) {
    const episodes = await this.tmdbApi.getEpisodes(intent.id, intent.season);
    const catalogEntry = await getShowCatalogEntryFulfilled(
      intent.id,
      this.hierarchyStore,
      this.catalogEntryStore
    );
    const shownEpisodes = compact(
      episodes.map((e) =>
        catalogEntry.items.some(
          (i) => i.season === e.season_number && i.episode === e.episode_number
        )
          ? e.episode_number
          : undefined
      )
    );

    return new ShowSeasonPageSummary({
      catalogEntry,
      episodes,
      shownEpisodes,
    });
  }
}
