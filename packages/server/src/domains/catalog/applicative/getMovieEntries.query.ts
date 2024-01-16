import {
  ApplicativeError,
  Query,
  QueryHandler,
} from "@media-center/domain-driven";
import { HierarchyStore } from "../../fileWatcher/applicative/hierarchy.store";
import { HierarchyItemId } from "../../fileWatcher/domain/hierarchyItemId";
import { CatalogEntryStore } from "./catalogEntry.store";
import {
  MovieCatalogEntryDatasetFulfilled,
  MovieCatalogEntryFulfilled,
} from "./catalogEntryFulfilled.front";
import { keyBy } from "@media-center/algorithm";

class NotMatchingHierarchyItem extends ApplicativeError {
  constructor(id: HierarchyItemId) {
    super(`Did not find matching hierary item ${id}`);
  }
}

export class GetMovieEntriesQuery extends Query(undefined, [
  MovieCatalogEntryFulfilled,
]) {}

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

    const neededHierarchyItemIds = new Set<string>();
    entries.forEach((entry) => {
      entry.dataset.hierarchyItemIds.forEach((i) =>
        neededHierarchyItemIds.add(i.toString())
      );
    });
    const items = keyBy(
      await this.hierarchyItemStore.loadMany(
        [...neededHierarchyItemIds.values()].map((i) => new HierarchyItemId(i))
      ),
      (e) => e.id.toString()
    );

    return entries.map((entry) => {
      const hierarchyItems = entry.dataset.hierarchyItemIds.map(
        (hierarchyItemId) => {
          const item = items[hierarchyItemId.toString()];
          if (!item) {
            throw new NotMatchingHierarchyItem(hierarchyItemId);
          }
          return item;
        }
      );

      return new MovieCatalogEntryFulfilled({
        id: entry.id,
        dataset: new MovieCatalogEntryDatasetFulfilled({ hierarchyItems }),
      });
    });
  }
}
