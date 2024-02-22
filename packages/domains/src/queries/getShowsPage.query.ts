import { Query, QueryHandler } from "@media-center/domain-driven";
import { uniqBy } from "@media-center/algorithm";
import { CatalogEntryStore } from "../catalog/applicative/catalogEntry.store";
import { TmdbStore } from "../tmdb/applicative/tmdb.store";
import { Show } from "../tmdb/domain/show";

export class GetShowsPageQuery extends Query(undefined, [Show]) {}

export class GetShowsPageQueryHandler extends QueryHandler(GetShowsPageQuery) {
  constructor(
    private readonly catalogEntryStore: CatalogEntryStore,
    private readonly tmdbStore: TmdbStore,
  ) {
    super();
  }

  async execute(intent: GetShowsPageQuery) {
    const allCatalogEntries = await this.catalogEntryStore.loadShows();
    const neededTmdbIds = uniqBy(
      allCatalogEntries.map((e) => e.id),
      (e) => e.toString(),
    );
    const allTmdbs = await this.tmdbStore.loadMany(neededTmdbIds);
    return allTmdbs
      .filter((e): e is Show => e instanceof Show)
      .sort((a, b) =>
        a.title.localeCompare(b.title, undefined, {
          sensitivity: "base",
        }),
      );
  }
}
