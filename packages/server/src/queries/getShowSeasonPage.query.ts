import { Query, QueryHandler, Shape } from "@media-center/domain-driven";
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
import { UserTmdbShowInfo } from "../domains/userTmdbInfo/domain/userTmdbInfo";
import {
  UserId,
  UserTmdbInfoId,
} from "../domains/userTmdbInfo/domain/userTmdbInfoId";
import { UserTmdbInfoStore } from "../domains/userTmdbInfo/applicative/userTmdbInfo.store";

class ShowSeasonPageSummary extends Shape({
  episodes: [ShowEpisode],
  shownEpisodes: [Number],
  catalogEntry: ShowCatalogEntryFulfilled,
  userInfo: UserTmdbShowInfo,
}) {}

export class GetShowSeasonPageQuery extends Query(
  { actorId: UserId, tmdbId: TmdbId, season: Number },
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
    private readonly catalogEntryStore: CatalogEntryStore,
    private readonly userTmdbInfoStore: UserTmdbInfoStore
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
      return event.tmdbId.equals(intent.tmdbId);
    }
    return event.catalogEntry.id.equals(intent.tmdbId);
  }

  async execute(intent: GetShowSeasonPageQuery) {
    const episodes = await this.tmdbApi.getEpisodes(
      intent.tmdbId,
      intent.season
    );
    const catalogEntry = await getShowCatalogEntryFulfilled(
      intent.tmdbId,
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

    const userInfoId = new UserTmdbInfoId(intent.actorId, intent.tmdbId);
    let userInfo = await this.userTmdbInfoStore.load(userInfoId);

    if (!userInfo || !(userInfo instanceof UserTmdbShowInfo)) {
      userInfo = new UserTmdbShowInfo({
        id: userInfoId,
        progress: [],
        updatedAt: Date.now(),
      });
    }

    return new ShowSeasonPageSummary({
      catalogEntry,
      episodes,
      shownEpisodes,
      userInfo,
    });
  }
}
