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
  CatalogEntryMovieSpecificationFulFilled,
  MovieCatalogEntryFulfilled,
} from "../domains/catalog/applicative/catalogEntryFulfilled.front";

class MoviePageSummary extends Shape({
  tmdb: Movie,
  details: MovieDetails,
  requests: [TorrentRequest],
  catalogEntry: MovieCatalogEntryFulfilled,
}) {}

export class GetMoviePageQuery extends Query(TmdbId, MoviePageSummary) {}

export class GetMoviePageQueryHandler extends QueryHandler(GetMoviePageQuery) {
  constructor(
    private readonly tmdbStore: TmdbStore,
    private readonly tmdbApi: TmdbAPI,
    private readonly torrentRequestStore: TorrentRequestStore,
    private readonly catalogEntryStore: CatalogEntryStore,
    private readonly hierarchyStore: HierarchyStore
  ) {
    super();
  }

  async execute(intent: GetMoviePageQuery) {
    const movie = await this.tmdbStore.load(intent.value);
    const details = await this.tmdbApi.getMovieDetails(intent.value);

    if (!details || !movie || !(movie instanceof Movie)) {
      throw new Error("Did not find TMDB movie");
    }

    const requests = await this.torrentRequestStore.loadByTmdbId(intent.value);
    const catalogEntry = await this.catalogEntryStore.load(intent.value);

    if (catalogEntry && !(catalogEntry instanceof MovieCatalogEntry)) {
      throw new Error("Cannot load catalog entry of movie");
    }

    const hierarchyItems = catalogEntry
      ? await this.hierarchyStore.loadMany(catalogEntry.items.map((e) => e.id))
      : [];

    const catalogEntryFulfilled = new MovieCatalogEntryFulfilled({
      id: intent.value,
      items: hierarchyItems.map(
        (e) => new CatalogEntryMovieSpecificationFulFilled({ item: e })
      ),
    });

    return new MoviePageSummary({
      tmdb: movie,
      catalogEntry: catalogEntryFulfilled,
      requests,
      details,
    });
  }
}
