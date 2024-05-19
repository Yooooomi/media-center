import { Query, QueryHandler, Shape } from "@media-center/domain-driven";
import { keyBy } from "@media-center/algorithm";
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
import { HierarchyEntryInformationStore } from "../hierarchyEntryInformation/applicative/hierarchyEntryInformation.store";
import { HierarchyEntryInformation } from "../hierarchyEntryInformation/domain/hierarchyEntryInformation";
import { HierarchyEntryInformationUpdated } from "../hierarchyEntryInformation/domain/hierarchyEntryInformation.events";
import { getShowCatalogEntryFulfilled } from "./showCatalogEntryFulfilled.service";

class ShowPageSummary extends Shape({
  tmdb: Show,
  requests: [TorrentRequest],
  catalogEntry: ShowCatalogEntryFulfilled,
  seasons: [ShowSeason],
  episodes: [{ season: Number, episodes: [ShowEpisode] }],
  userInfo: UserTmdbShowInfo,
  hierarchyEntryInformation: [
    { season: Number, episode: Number, information: HierarchyEntryInformation },
  ],
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
  HierarchyEntryInformationUpdated,
]) {
  constructor(
    private readonly tmdbStore: TmdbStore,
    private readonly tmdbApi: TmdbAPI,
    private readonly torrentRequestStore: TorrentRequestStore,
    private readonly catalogEntryStore: CatalogEntryStore,
    private readonly hierarchyStore: HierarchyStore,
    private readonly userTmdbInfoStore: UserTmdbInfoStore,
    private readonly hierarchyEntryInformationStore: HierarchyEntryInformationStore,
  ) {
    super();
  }

  async shouldReact(
    event:
      | CatalogDeleted
      | CatalogEntryUpdated
      | CatalogEntryDeleted
      | TorrentRequestAdded
      | TorrentRequestUpdated
      | UserTmdbInfoUpdated
      | HierarchyEntryInformationUpdated,
    intent: GetShowPageQuery,
  ) {
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
    if (event instanceof HierarchyEntryInformationUpdated) {
      const catalogEntry = await this.catalogEntryStore.load(intent.tmdbId);
      if (!catalogEntry) {
        return false;
      }
      return catalogEntry.hasHierarchyItemId(event.hierarchyItemId);
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

    const allHierarchyItems = catalogEntryFulfilled.dataset.flatMap(
      (e) => e.hierarchyItems,
    );
    const hierarchyEntryInformation = keyBy(
      await this.hierarchyEntryInformationStore.loadMany(
        allHierarchyItems.map((h) => h.id),
      ),
      (e) => e.id.toString(),
    );

    const informationPerEpisode = catalogEntryFulfilled.dataset.reduce<
      Record<number, Record<number, HierarchyEntryInformation>>
    >((acc, curr) => {
      const season = acc[curr.season] ?? {};
      const firstHierarchyItemId = curr.hierarchyItems[0]?.id;
      if (!firstHierarchyItemId) {
        return acc;
      }
      const firstHierarchyItemInformation =
        hierarchyEntryInformation[firstHierarchyItemId.toString()];
      if (!firstHierarchyItemInformation) {
        return acc;
      }
      season[curr.episode] = firstHierarchyItemInformation;
      acc[curr.season] = season;
      return acc;
    }, {});

    let seasons = await this.tmdbApi.getSeasons(intent.tmdbId);
    seasons = seasons.filter((season) => season.season_number !== 0);
    const episodes = await Promise.all(
      seasons.map(async (season) => ({
        season: season.season_number,
        episodes: await this.tmdbApi.getEpisodes(
          intent.tmdbId,
          season.season_number,
        ),
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
      seasons,
      episodes: episodes,
      userInfo,
      hierarchyEntryInformation: Object.entries(informationPerEpisode).flatMap(
        ([season, seasonEpisodes]) => {
          return Object.entries(seasonEpisodes).map(
            ([episode, information]) => ({
              season: +season,
              episode: +episode,
              information,
            }),
          );
        },
      ),
    });
  }
}
