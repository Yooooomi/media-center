import { Query, QueryHandler, Shape } from "@media-center/domain-driven";
import {
  CatalogDeleted,
  CatalogEntryUpdated,
  CatalogEntryDeleted,
} from "../catalog/applicative/catalog.events";
import { CatalogEntryStore } from "../catalog/applicative/catalogEntry.store";
import { ShowCatalogEntryFulfilled } from "../catalog/applicative/catalogEntryFulfilled.front";
import { HierarchyStore } from "../fileWatcher/applicative/hierarchy.store";
import { TmdbAPI } from "../tmdb/applicative/tmdb.api";
import { TmdbStore } from "../tmdb/applicative/tmdb.store";
import { Show } from "../tmdb/domain/show";
import { ShowEpisode } from "../tmdb/domain/showEpisode";
import { ShowSeason } from "../tmdb/domain/showSeason";
import { TmdbId } from "../tmdb/domain/tmdbId";
import { TorrentRequestStore } from "../torrentRequest/applicative/torrentRequest.store";
import { TorrentRequest } from "../torrentRequest/domain/torrentRequest";
import {
  TorrentRequestAdded,
  TorrentRequestUpdated,
} from "../torrentRequest/domain/torrentRequest.events";
import { UserTmdbInfoStore } from "../userTmdbInfo/applicative/userTmdbInfo.store";
import { UserTmdbShowInfo } from "../userTmdbInfo/domain/userTmdbInfo";
import { UserTmdbInfoUpdated } from "../userTmdbInfo/domain/userTmdbInfo.events";
import { UserId, UserTmdbInfoId } from "../userTmdbInfo/domain/userTmdbInfoId";
import { getShowCatalogEntryFulfilled } from "./showCatalogEntryFulfilled.service";

class ShowPageSummary extends Shape({
  tmdb: Show,
  requests: [TorrentRequest],
  catalogEntry: ShowCatalogEntryFulfilled,
  seasons: [ShowSeason],
  episodes: [{ season: Number, episodes: [ShowEpisode] }],
  userInfo: UserTmdbShowInfo,
}) {}

export class GetShowPageQuery extends Query(
  { actorId: UserId, tmdbId: TmdbId },
  ShowPageSummary,
) {}

export class GetShowPageQueryHandler extends QueryHandler(GetShowPageQuery, [
  CatalogDeleted,
  CatalogEntryUpdated,
  CatalogEntryDeleted,
  TorrentRequestAdded,
  TorrentRequestUpdated,
  UserTmdbInfoUpdated,
]) {
  constructor(
    private readonly tmdbStore: TmdbStore,
    private readonly tmdbApi: TmdbAPI,
    private readonly torrentRequestStore: TorrentRequestStore,
    private readonly catalogEntryStore: CatalogEntryStore,
    private readonly hierarchyStore: HierarchyStore,
    private readonly userTmdbInfoStore: UserTmdbInfoStore,
  ) {
    super();
  }

  shouldReact(
    event:
      | CatalogDeleted
      | CatalogEntryUpdated
      | CatalogEntryDeleted
      | TorrentRequestAdded
      | TorrentRequestUpdated
      | UserTmdbInfoUpdated,
    intent: GetShowPageQuery,
  ): boolean {
    if (event instanceof UserTmdbInfoUpdated) {
      return event.userTmdbInfoId.equals(event.userTmdbInfoId);
    }
    if (event instanceof CatalogDeleted) {
      return true;
    }
    if (
      event instanceof TorrentRequestAdded ||
      event instanceof TorrentRequestUpdated
    ) {
      return event.tmdbId.equals(intent.tmdbId);
    }
    return event.catalogEntry.id.equals(intent.tmdbId);
  }

  async execute(intent: GetShowPageQuery): Promise<ShowPageSummary> {
    const tmdb = await this.tmdbStore.load(intent.tmdbId);

    if (!tmdb || !(tmdb instanceof Show)) {
      throw new Error("Cannot load Show TMDB");
    }

    const requests = await this.torrentRequestStore.loadByTmdbId(intent.tmdbId);

    const catalogEntryFulfilled = await getShowCatalogEntryFulfilled(
      intent.tmdbId,
      this.hierarchyStore,
      this.catalogEntryStore,
    );

    const seasons = await this.tmdbApi.getSeasons(intent.tmdbId);
    const neededSeasonNumbers = catalogEntryFulfilled.availableSeasons();
    const neededSeasons = seasons.filter((season) =>
      neededSeasonNumbers.includes(season.season_number),
    );
    const episodes = await Promise.all(
      neededSeasonNumbers.map(async (seasonNumber) => ({
        season: seasonNumber,
        episodes: await this.tmdbApi.getEpisodes(intent.tmdbId, seasonNumber),
      })),
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

    return new ShowPageSummary({
      tmdb,
      requests,
      catalogEntry: catalogEntryFulfilled,
      seasons: neededSeasons,
      episodes,
      userInfo,
    });
  }
}
