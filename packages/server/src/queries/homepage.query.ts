import {
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

class TorrentRequestFulfilled extends Shape({
  torrent: TorrentRequest,
  tmdb: Optional(Either(Movie, Show)),
}) {}

class MovieCatalogEntryFulfilled extends Shape({
  entry: MovieCatalogEntry,
  tmdb: Movie,
}) {}

class ShowCatalogEntryFulfilled extends Shape({
  entry: ShowCatalogEntry,
  tmdb: Show,
}) {}

export class HomepageSummary extends Shape({
  catalog: {
    movies: [MovieCatalogEntryFulfilled],
    shows: [ShowCatalogEntryFulfilled],
  },
  downloading: [TorrentRequestFulfilled],
}) {}

export class HomepageQuery extends Query(undefined, HomepageSummary) {}

export class HomepageQueryHandler extends QueryHandler(HomepageQuery) {
  constructor(
    private readonly catalogEntryStore: CatalogEntryStore,
    private readonly torrentRequestStore: TorrentRequestStore,
    private readonly tmdbStore: TmdbStore
  ) {
    super();
  }

  async execute(): Promise<HomepageSummary> {
    const catalogEntries = await this.catalogEntryStore.loadAll();
    const torrentRequests = await this.torrentRequestStore.loadAll();

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
        return new MovieCatalogEntryFulfilled({
          entry: movie,
          tmdb,
        });
      });
    const fulfilledShows = catalogEntries
      .filter((e): e is ShowCatalogEntry => e instanceof ShowCatalogEntry)
      .map((show) => {
        const tmdb = tmdbs[show.id.toString()];
        if (!tmdb || !(tmdb instanceof Show)) {
          throw new Error("Cannot find related tmdb");
        }
        return new ShowCatalogEntryFulfilled({
          entry: show,
          tmdb,
        });
      });
    const fulfilledRequests = torrentRequests.map((e) => {
      return new TorrentRequestFulfilled({
        torrent: e,
        tmdb: tmdbs[e.tmdbId.toString()],
      });
    });

    return new HomepageSummary({
      catalog: {
        movies: fulfilledMovies,
        shows: fulfilledShows,
      },
      downloading: fulfilledRequests,
    });
  }
}
