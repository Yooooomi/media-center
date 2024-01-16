import { Query, QueryHandler, Shape } from "@media-center/domain-driven";
import { Movie } from "../domains/tmdb/domain/movie";
import { TorrentRequest } from "../domains/torrentRequest/domain/torrentRequest";
import { MovieCatalogEntry } from "../domains/catalog/domain/catalogEntry";
import { TmdbStore } from "../domains/tmdb/applicative/tmdb.store";
import { TorrentRequestStore } from "../domains/torrentRequest/applicative/torrentRequest.store";
import { HierarchyStore } from "../domains/fileWatcher/applicative/hierarchy.store";
import { TmdbId } from "../domains/tmdb/domain/tmdbId";
import { CatalogEntryStore } from "../domains/catalog/applicative/catalogEntry.store";
import { MovieDetails } from "../domains/tmdb/domain/movieDetails";
import { TmdbAPI } from "../domains/tmdb/applicative/tmdb.api";
import {
  MovieCatalogEntryDatasetFulfilled,
  MovieCatalogEntryFulfilled,
} from "../domains/catalog/applicative/catalogEntryFulfilled.front";
import {
  CatalogDeleted,
  CatalogEntryDeleted,
  CatalogEntryUpdated,
} from "../domains/catalog/applicative/catalog.events";
import {
  TorrentRequestAdded,
  TorrentRequestUpdated,
} from "../domains/torrentRequest/domain/torrentRequest.events";
import { UserTmdbInfoStore } from "../domains/userTmdbInfo/applicative/userTmdbInfo.store";
import {
  UserId,
  UserTmdbInfoId,
} from "../domains/userTmdbInfo/domain/userTmdbInfoId";
import { UserTmdbMovieInfo } from "../domains/userTmdbInfo/domain/userTmdbInfo";

class MoviePageSummary extends Shape({
  tmdb: Movie,
  details: MovieDetails,
  requests: [TorrentRequest],
  catalogEntry: MovieCatalogEntryFulfilled,
  userInfo: UserTmdbMovieInfo,
}) {}

export class GetMoviePageQuery extends Query(
  { actorId: UserId, tmdbId: TmdbId },
  MoviePageSummary
) {}

export class GetMoviePageQueryHandler extends QueryHandler(GetMoviePageQuery, [
  CatalogDeleted,
  CatalogEntryUpdated,
  CatalogEntryDeleted,
  TorrentRequestAdded,
  TorrentRequestUpdated,
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
      | TorrentRequestUpdated,
    intent: GetMoviePageQuery
  ) {
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
          catalogEntry.dataset.hierarchyItemIds
        )
      : [];

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
    });
  }
}
