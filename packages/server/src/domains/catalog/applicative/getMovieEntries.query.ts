import {
  ApplicativeError,
  Query,
  Multiple,
  QueryHandler,
} from "@media-center/domain-driven";
import { HierarchyStore } from "../../fileWatcher/applicative/hierarchy.store";
import { HierarchyItemId } from "../../fileWatcher/domain/hierarchyItemId";
import { CatalogEntryStore } from "./catalogEntry.store";
import {
  CatalogEntryMovieSpecificationFulFilled,
  MovieCatalogEntryFulfilled,
} from "./catalogEntryFulfilled.front";

class NotMatchingHierarchyItem extends ApplicativeError {
  constructor(id: HierarchyItemId) {
    super(`Did not find matching hierary item ${id}`);
  }
}

export class GetMovieEntriesQuery extends Query({
  returning: Multiple(MovieCatalogEntryFulfilled),
}) {}

export class GetMovieEntriesQueryHandler extends QueryHandler(
  GetMovieEntriesQuery
) {
  constructor(
    private readonly catalogEntryStore: CatalogEntryStore,
    private readonly hierarchyItemStore: HierarchyStore
  ) {
    super();
  }

  async execute() {
    const entries = await this.catalogEntryStore.loadMovies();

    const ids = new Set<string>();
    entries.forEach((entry) => {
      entry.items.flatMap((i) => i.id).forEach((i) => ids.add(i.toString()));
    });
    const items = await this.hierarchyItemStore.loadMany(
      [...ids.values()].map((i) => new HierarchyItemId(i))
    );

    return entries.map((entry) => {
      return new MovieCatalogEntryFulfilled({
        id: entry.id,
        items: entry.items.map((e) => {
          const item = items.find((i) => i.id.equals(e.id));
          if (!item) {
            throw new NotMatchingHierarchyItem(e.id);
          }
          return new CatalogEntryMovieSpecificationFulFilled({
            item,
          });
        }),
      });
    });
  }
}
