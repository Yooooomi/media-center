import { keyBy } from "@media-center/algorithm";
import { CatalogEntryStore } from "../domains/catalog/applicative/catalogEntry.store";
import {
  ShowCatalogEntryFulfilled,
  CatalogEntryShowSpecificationFulFilled,
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
  const showSpecifications = catalogEntry?.items ?? [];
  const hierarchyItems = keyBy(
    catalogEntry
      ? await hierarchyStore.loadMany(showSpecifications.map((e) => e.id))
      : [],
    (e) => e.id.toString()
  );
  const catalogEntryFulfilled = new ShowCatalogEntryFulfilled({
    id: tmdbId,
    items: showSpecifications.map((showSpecification) => {
      const fulfilled = hierarchyItems[showSpecification.id.toString()];
      if (!fulfilled) {
        throw new Error("Cannot find fulfilled hierarchy item");
      }
      return new CatalogEntryShowSpecificationFulFilled({
        item: fulfilled,
        episode: showSpecification.episode,
        season: showSpecification.season,
      });
    }),
  });

  return catalogEntryFulfilled;
}
