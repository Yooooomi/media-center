import { Query, QueryHandler, Shape } from "@media-center/domain-driven";
import { keyBy, uniqBy } from "@media-center/algorithm";
import { Show } from "../domains/tmdb/domain/show";
import { TorrentRequest } from "../domains/torrentRequest/domain/torrentRequest";
import { ShowCatalogEntryFulfilled } from "../domains/catalog/applicative/catalogEntryFulfilled.front";
import { TmdbId } from "../domains/tmdb/domain/tmdbId";
import { TmdbStore } from "../domains/tmdb/applicative/tmdb.store";
import { TorrentRequestStore } from "../domains/torrentRequest/applicative/torrentRequest.store";
import { CatalogEntryStore } from "../domains/catalog/applicative/catalogEntry.store";
import { HierarchyStore } from "../domains/fileWatcher/applicative/hierarchy.store";
import { ShowCatalogEntry } from "../domains/catalog/domain/catalogEntry";
import { ShowSeason } from "../domains/tmdb/domain/showSeason";
import { TmdbAPI } from "../domains/tmdb/applicative/tmdb.api";
import {
  CatalogDeleted,
  CatalogEntryDeleted,
  CatalogEntryUpdated,
} from "../domains/catalog/applicative/catalog.events";
import {
  TorrentRequestAdded,
  TorrentRequestUpdated,
} from "../domains/torrentRequest/domain/torrentRequest.events";
import { ShowEpisode } from "../domains/tmdb/domain/showEpisode";
import { UserTmdbShowInfo } from "../domains/userTmdbInfo/domain/userTmdbInfo";
import {
  UserId,
  UserTmdbInfoId,
} from "../domains/userTmdbInfo/domain/userTmdbInfoId";
import { UserTmdbInfoStore } from "../domains/userTmdbInfo/applicative/userTmdbInfo.store";
import { UserTmdbInfoUpdated } from "../domains/userTmdbInfo/domain/userTmdbInfo.events";
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
  ShowPageSummary
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
    private readonly userTmdbInfoStore: UserTmdbInfoStore
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
    intent: GetShowPageQuery
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
      this.catalogEntryStore
    );

    const seasons = await this.tmdbApi.getSeasons(intent.tmdbId);
    const neededSeasonNumbers = catalogEntryFulfilled.availableSeasons();
    const neededSeasons = seasons.filter((season) =>
      neededSeasonNumbers.includes(season.season_number)
    );
    const episodes = await Promise.all(
      neededSeasonNumbers.map(async (seasonNumber) => ({
        season: seasonNumber,
        episodes: await this.tmdbApi.getEpisodes(intent.tmdbId, seasonNumber),
      }))
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
