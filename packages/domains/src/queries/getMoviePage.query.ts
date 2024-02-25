import {
  Optional,
  Query,
  QueryHandler,
  Shape,
} from "@media-center/domain-driven";
import { keyBy } from "@media-center/algorithm";
import {
  CatalogDeleted,
  CatalogEntryUpdated,
  CatalogEntryDeleted,
} from "../catalog/applicative/catalog.events";
import { CatalogEntryStore } from "../catalog/applicative/catalogEntry.store";
import {
  MovieCatalogEntryFulfilled,
  MovieCatalogEntryDatasetFulfilled,
} from "../catalog/applicative/catalogEntryFulfilled.front";
import { MovieCatalogEntry } from "../catalog/domain/catalogEntry";
import { HierarchyStore } from "../fileWatcher/applicative/hierarchy.store";
import { TmdbAPI } from "../tmdb/applicative/tmdb.api";
import { TmdbStore } from "../tmdb/applicative/tmdb.store";
import { Movie } from "../tmdb/domain/movie";
import { MovieDetails } from "../tmdb/domain/movieDetails";
import { TmdbId } from "../tmdb/domain/tmdbId";
import { TorrentRequestStore } from "../torrentRequest/applicative/torrentRequest.store";
import { TorrentRequest } from "../torrentRequest/domain/torrentRequest";
import {
  TorrentRequestAdded,
  TorrentRequestUpdated,
} from "../torrentRequest/domain/torrentRequest.events";
import { UserTmdbInfoStore } from "../userTmdbInfo/applicative/userTmdbInfo.store";
import { UserTmdbMovieInfo } from "../userTmdbInfo/domain/userTmdbInfo";
import { UserTmdbInfoUpdated } from "../userTmdbInfo/domain/userTmdbInfo.events";
import { UserId, UserTmdbInfoId } from "../userTmdbInfo/domain/userTmdbInfoId";
import { HierarchyEntryInformationStore } from "../hierarchyEntryInformation/applicative/hierarchyEntryInformation.store";
import { HierarchyEntryInformation } from "../hierarchyEntryInformation/domain/hierarchyEntryInformation";
import { HierarchyEntryInformationUpdated } from "../hierarchyEntryInformation/domain/hierarchyEntryInformation.events";

class MoviePageSummary extends Shape({
  tmdb: Movie,
  details: MovieDetails,
  requests: [TorrentRequest],
  catalogEntry: MovieCatalogEntryFulfilled,
  userInfo: UserTmdbMovieInfo,
  firstHierarchyInformation: Optional(HierarchyEntryInformation),
}) {}

export class GetMoviePageQuery extends Query(
  { actorId: UserId, tmdbId: TmdbId },
  MoviePageSummary,
) {}

export class GetMoviePageQueryHandler extends QueryHandler(GetMoviePageQuery, [
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
    intent: GetMoviePageQuery,
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
      return catalogEntry
        .getHierarchyItemIds()
        .some((e) => e.equals(event.hierarchyItemId));
    }
    return event.catalogEntry.id.equals(intent.tmdbId);
  }

  async execute(intent: GetMoviePageQuery) {
    const movie = await this.tmdbStore.load(intent.tmdbId);
    const details = await this.tmdbApi.getMovieDetails(intent.tmdbId);

    if (!details || !movie || !(movie instanceof Movie)) {
      throw new Error("Did not find TMDB movie");
    }

    const requests = await this.torrentRequestStore.loadByTmdbId(intent.tmdbId);
    const catalogEntry = await this.catalogEntryStore.load(intent.tmdbId);

    if (catalogEntry && !(catalogEntry instanceof MovieCatalogEntry)) {
      throw new Error("Cannot load catalog entry of movie");
    }

    const hierarchyItems = catalogEntry
      ? await this.hierarchyStore.loadMany(
          catalogEntry.dataset.hierarchyItemIds,
        )
      : [];

    const hierarchyEntryInformation = keyBy(
      await this.hierarchyEntryInformationStore.loadMany(
        hierarchyItems.map((h) => h.id),
      ),
      (e) => e.id.toString(),
    );

    const analyzed = hierarchyItems.every(
      (item) => hierarchyEntryInformation[item.id.toString()],
    );
    const firstHierarchyItemId = hierarchyItems[0]?.id.toString();
    const firstHierarchyInformation = firstHierarchyItemId
      ? hierarchyEntryInformation[firstHierarchyItemId]
      : undefined;

    const catalogEntryFulfilled = new MovieCatalogEntryFulfilled({
      id: intent.tmdbId,
      dataset: new MovieCatalogEntryDatasetFulfilled({ hierarchyItems }),
    });

    const userInfoId = new UserTmdbInfoId(intent.actorId, intent.tmdbId);
    let userInfo = await this.userTmdbInfoStore.load(userInfoId);

    if (!userInfo || !(userInfo instanceof UserTmdbMovieInfo)) {
      userInfo = new UserTmdbMovieInfo({
        id: userInfoId,
        progress: 0,
        updatedAt: Date.now(),
      });
    }

    return new MoviePageSummary({
      tmdb: movie,
      catalogEntry: catalogEntryFulfilled,
      requests,
      details,
      userInfo,
      firstHierarchyInformation,
    });
  }
}
