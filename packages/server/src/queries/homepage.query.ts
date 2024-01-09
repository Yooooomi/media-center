import {
  BaseIntent,
  Either,
  Optional,
  Query,
  QueryHandler,
  Shape,
} from "@media-center/domain-driven";
import { TorrentRequest } from "../domains/torrentRequest/domain/torrentRequest";
import { Movie } from "../domains/tmdb/domain/movie";
import { Show } from "../domains/tmdb/domain/show";
import { CatalogEntryStore } from "../domains/catalog/applicative/catalogEntry.store";
import { TmdbStore } from "../domains/tmdb/applicative/tmdb.store";
import { TorrentRequestStore } from "../domains/torrentRequest/applicative/torrentRequest.store";
import { TmdbId } from "../domains/tmdb/domain/tmdbId";
import {
  MovieCatalogEntry,
  ShowCatalogEntry,
} from "../domains/catalog/domain/catalogEntry";
import { keyBy } from "@media-center/algorithm";
import {
  CatalogEntryUpdated,
  CatalogEntryDeleted,
  CatalogDeleted,
} from "../domains/catalog/applicative/catalog.events";
import {
  TorrentRequestAdded,
  TorrentRequestUpdated,
} from "../domains/torrentRequest/domain/torrentRequest.events";
import {
  UserTmdbMovieInfo,
  UserTmdbShowInfo,
} from "../domains/userTmdbInfo/domain/userTmdbInfo";
import { UserTmdbInfoStore } from "../domains/userTmdbInfo/applicative/userTmdbInfo.store";
import {
  UserId,
  UserTmdbInfoId,
} from "../domains/userTmdbInfo/domain/userTmdbInfoId";

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
          console.log("Movie", tmdb, movie.serialize());
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
          console.log("Show", tmdb);
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
      ...fulfilledMovies.filter((e) => e.userInfo.progress !== 0),
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
