import {
  ApplicativeError,
  Query,
  QueryHandler,
} from "@media-center/domain-driven";
import { HierarchyStore } from "../../fileWatcher/applicative/hierarchy.store";
import { HierarchyItemId } from "../../fileWatcher/domain/hierarchyItemId";
import { CatalogEntryStore } from "./catalogEntry.store";
import {
  ShowCatalogEntryDatasetFulfilled,
  ShowCatalogEntryFulfilled,
} from "./catalogEntryFulfilled.front";
import { keyBy } from "@media-center/algorithm";

class NotMatchingHierarchyItem extends ApplicativeError {
  constructor(id: HierarchyItemId) {
    super(`Did not find matching hierary item ${id}`);
  }
}

export class GetShowEntriesQuery extends Query(undefined, [
  ShowCatalogEntryFulfilled,
]) {}

export class GetShowEntriesQueryHandler extends QueryHandler(
  GetShowEntriesQuery
) {
  constructor(
    private readonly catalogEntryStore: CatalogEntryStore,
    private readonly hierarchyItemStore: HierarchyStore
  ) {
    super();
  }

  async execute() {
    const entries = await this.catalogEntryStore.loadShows();

    const neededHierarchyItemIds = new Set<string>();
    entries.forEach((entry) => {
      entry.dataset
        .flatMap((i) => i.hierarchyItemIds)
        .forEach((i) => neededHierarchyItemIds.add(i.toString()));
    });
    const neededHierarchyItems = keyBy(
      await this.hierarchyItemStore.loadMany(
        [...neededHierarchyItemIds.values()].map((i) => new HierarchyItemId(i))
      ),
      (e) => e.id.toString()
    );

    return entries.map((entry) => {
      return new ShowCatalogEntryFulfilled({
        id: entry.id,
        dataset: entry.dataset.map((e) => {
          const hierarchyItems = e.hierarchyItemIds.map((hierarchyItemId) => {
            const hierarchyItem =
              neededHierarchyItems[hierarchyItemId.toString()];
            if (!hierarchyItem) {
              throw new NotMatchingHierarchyItem(hierarchyItemId);
            }
            return hierarchyItem;
          });
          return new ShowCatalogEntryDatasetFulfilled({
            hierarchyItems,
            season: e.season,
            episode: e.episode,
          });
        }),
      });
    });
  }
}
