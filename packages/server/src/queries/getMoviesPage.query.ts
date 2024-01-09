import { Query, QueryHandler } from "@media-center/domain-driven";
import { Movie } from "../domains/tmdb/domain/movie";
import { CatalogEntryStore } from "../domains/catalog/applicative/catalogEntry.store";
import { TmdbStore } from "../domains/tmdb/applicative/tmdb.store";
import { uniqBy } from "@media-center/algorithm";

export class GetMoviesPageQuery extends Query(undefined, [Movie]) {}

export class GetMoviesPageQueryHandler extends QueryHandler(
  GetMoviesPageQuery
) {
  constructor(
    private readonly catalogEntryStore: CatalogEntryStore,
    private readonly tmdbStore: TmdbStore
  ) {
    super();
  }

  async execute(intent: GetMoviesPageQuery) {
    const allCatalogEntries = await this.catalogEntryStore.loadMovies();
    const neededTmdbIds = uniqBy(
      allCatalogEntries.map((e) => e.id),
      (e) => e.toString()
    );
    const allTmdbs = await this.tmdbStore.loadMany(neededTmdbIds);
    return allTmdbs
      .filter((e): e is Movie => e instanceof Movie)
      .sort((a, b) =>
        a.title.localeCompare(b.title, undefined, {
          sensitivity: "base",
        })
      );
  }
}
