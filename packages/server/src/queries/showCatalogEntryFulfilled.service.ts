import { keyBy } from "@media-center/algorithm";
import { CatalogEntryStore } from "../domains/catalog/applicative/catalogEntry.store";
import {
  ShowCatalogEntryDatasetFulfilled,
  ShowCatalogEntryFulfilled,
} from "../domains/catalog/applicative/catalogEntryFulfilled.front";
import { ShowCatalogEntry } from "../domains/catalog/domain/catalogEntry";
import { TmdbId } from "../domains/tmdb/domain/tmdbId";
import { HierarchyStore } from "../domains/fileWatcher/applicative/hierarchy.store";

export async function getShowCatalogEntryFulfilled(
  tmdbId: TmdbId,
  hierarchyStore: HierarchyStore,
  catalogEntryStore: CatalogEntryStore
) {
  const catalogEntry = await catalogEntryStore.load(tmdbId);

  if (catalogEntry && !(catalogEntry instanceof ShowCatalogEntry)) {
    throw new Error("Invalid CatalogShowEntry");
  }
  const showDataset = catalogEntry?.dataset ?? [];
  const hierarchyItems = keyBy(
    catalogEntry
      ? await hierarchyStore.loadMany(
          showDataset.map((e) => e.hierarchyItemIds).flat()
        )
      : [],
    (e) => e.id.toString()
  );
  const catalogEntryFulfilled = new ShowCatalogEntryFulfilled({
    id: tmdbId,
    dataset: showDataset.map((showSpecification) => {
      const fulfilled = showSpecification.hierarchyItemIds.map((e) => {
        const item = hierarchyItems[e.toString()];
        if (!item) {
          throw new Error("Cannot find fulfilled hierarchy item");
        }
        return item;
      });
      return new ShowCatalogEntryDatasetFulfilled({
        hierarchyItems: fulfilled,
        episode: showSpecification.episode,
        season: showSpecification.season,
      });
    }),
  });

  return catalogEntryFulfilled;
}
