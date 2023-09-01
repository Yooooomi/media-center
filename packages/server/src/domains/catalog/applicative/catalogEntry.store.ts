import { Store } from "../../../framework/store";
import { HierarchyItemId } from "../../fileWatcher/domain/hierarchyItemId";
import { TmdbId } from "../../tmdb/domain/tmdbId";
import { CatalogEntry } from "../domain/catalogEntry";

export abstract class CatalogEntryStore extends Store<CatalogEntry, TmdbId> {
  abstract loadByHierarchyItemId(
    hierarchyItemId: HierarchyItemId
  ): Promise<CatalogEntry[]>;
}
