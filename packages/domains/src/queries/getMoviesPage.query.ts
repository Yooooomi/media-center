import { Query, QueryHandler } from "@media-center/domain-driven";
import { uniqBy } from "@media-center/algorithm";
import { CatalogEntryStore } from "../catalog/applicative/catalogEntry.store";
import { TmdbStore } from "../tmdb/applicative/tmdb.store";
import { Movie } from "../tmdb/domain/movie";

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
