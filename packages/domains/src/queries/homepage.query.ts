import {
  Either,
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
  MovieCatalogEntry,
  ShowCatalogEntry,
} from "../catalog/domain/catalogEntry";
import { TmdbStore } from "../tmdb/applicative/tmdb.store";
import { Movie } from "../tmdb/domain/movie";
import { Show } from "../tmdb/domain/show";
import { TmdbId } from "../tmdb/domain/tmdbId";
import { TorrentRequestStore } from "../torrentRequest/applicative/torrentRequest.store";
import { TorrentRequest } from "../torrentRequest/domain/torrentRequest";
import {
  TorrentRequestAdded,
  TorrentRequestUpdated,
} from "../torrentRequest/domain/torrentRequest.events";
import { UserTmdbInfoStore } from "../userTmdbInfo/applicative/userTmdbInfo.store";
import {
  UserTmdbMovieInfo,
  UserTmdbShowInfo,
} from "../userTmdbInfo/domain/userTmdbInfo";
import { UserId, UserTmdbInfoId } from "../userTmdbInfo/domain/userTmdbInfoId";

class TorrentRequestFulfilled extends Shape({
  torrent: TorrentRequest,
  tmdb: Optional(Either(Movie, Show)),
}) {}

class MovieCatalogEntryContext extends Shape({
  entry: MovieCatalogEntry,
  tmdb: Movie,
  userInfo: UserTmdbMovieInfo,
}) {}

class ShowCatalogEntryContext extends Shape({
  entry: ShowCatalogEntry,
  tmdb: Show,
  userInfo: UserTmdbShowInfo,
}) {}

export class HomepageSummary extends Shape({
  continue: [Either(MovieCatalogEntryContext, ShowCatalogEntryContext)],
  catalog: {
    movies: [MovieCatalogEntryContext],
    shows: [ShowCatalogEntryContext],
  },
  downloading: [TorrentRequestFulfilled],
}) {}

export class HomepageQuery extends Query(UserId, HomepageSummary) {}

export class HomepageQueryHandler extends QueryHandler(HomepageQuery, [
  CatalogDeleted,
  CatalogEntryUpdated,
  CatalogEntryDeleted,
  TorrentRequestAdded,
  TorrentRequestUpdated,
]) {
  constructor(
    private readonly catalogEntryStore: CatalogEntryStore,
    private readonly torrentRequestStore: TorrentRequestStore,
    private readonly userTmdbInfoStore: UserTmdbInfoStore,
    private readonly tmdbStore: TmdbStore
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
  ) {
    return true;
  }

  async execute(intent: HomepageQuery): Promise<HomepageSummary> {
    const catalogEntries = (
      await Promise.all([
        this.catalogEntryStore.loadNewestMovies(25),
        this.catalogEntryStore.loadNewestShows(25),
      ])
    ).flat();
    const torrentRequests = await this.torrentRequestStore.loadAll();
    const userInfos = await this.userTmdbInfoStore.loadByUserId(intent.value);

    const userInfosDict = keyBy(userInfos, (info) => info.id.tmdbId.toString());

    const neededTmdbs = new Set([
      ...catalogEntries.map((entry) => entry.id.toString()),
      ...torrentRequests.map((request) => request.tmdbId.toString()),
    ]);
    const neededTmdbIds = [...neededTmdbs.keys()].map((e) => new TmdbId(e));

    const tmdbs = keyBy(await this.tmdbStore.loadMany(neededTmdbIds), (e) =>
      e.id.toString()
    );

    const fulfilledMovies = catalogEntries
      .filter((e): e is MovieCatalogEntry => e instanceof MovieCatalogEntry)
      .map((movie) => {
        const tmdb = tmdbs[movie.id.toString()];
        if (!tmdb || !(tmdb instanceof Movie)) {
          throw new Error("Cannot find related tmdb");
        }
        let userInfo = userInfosDict[tmdb.id.toString()];
        if (!userInfo || !(userInfo instanceof UserTmdbMovieInfo)) {
          userInfo = new UserTmdbMovieInfo({
            id: new UserTmdbInfoId(intent.value, tmdb.id),
            progress: 0,
            updatedAt: Date.now(),
          });
        }
        return new MovieCatalogEntryContext({
          entry: movie,
          tmdb,
          userInfo,
        });
      });
    const fulfilledShows = catalogEntries
      .filter((e): e is ShowCatalogEntry => e instanceof ShowCatalogEntry)
      .map((show) => {
        const tmdb = tmdbs[show.id.toString()];
        if (!tmdb || !(tmdb instanceof Show)) {
          throw new Error("Cannot find related tmdb");
        }
        let userInfo = userInfosDict[tmdb.id.toString()];
        if (!userInfo || !(userInfo instanceof UserTmdbShowInfo)) {
          userInfo = new UserTmdbShowInfo({
            id: new UserTmdbInfoId(intent.value, tmdb.id),
            progress: [],
            updatedAt: Date.now(),
          });
        }
        return new ShowCatalogEntryContext({
          entry: show,
          tmdb,
          userInfo,
        });
      });
    const fulfilledRequests = torrentRequests.map((e) => {
      return new TorrentRequestFulfilled({
        torrent: e,
        tmdb: tmdbs[e.tmdbId.toString()],
      });
    });

    const toContinue = [
      ...fulfilledMovies.filter((e) => !e.userInfo.isFinished()),
      ...fulfilledShows.filter((e) => e.userInfo.getShowProgress() !== 0),
    ].sort((a, b) => b.userInfo.updatedAt - a.userInfo.updatedAt);

    return new HomepageSummary({
      continue: toContinue,
      catalog: {
        movies: fulfilledMovies,
        shows: fulfilledShows,
      },
      downloading: fulfilledRequests,
    });
  }
}
