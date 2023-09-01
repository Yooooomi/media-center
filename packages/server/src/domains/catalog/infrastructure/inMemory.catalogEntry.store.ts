import { InMemoryStore } from "../../../framework/store";
import { HierarchyItemId } from "../../fileWatcher/domain/hierarchyItemId";
import { TmdbId } from "../../tmdb/domain/tmdbId";
import { CatalogEntryStore } from "../applicative/catalogEntry.store";
import { CatalogEntry } from "../domain/catalogEntry";
import { V0CatalogEntrySerializer } from "./v0.catalogEntry.serializer";

export class InMemoryCatalogEntryStore
  extends InMemoryStore<CatalogEntry, TmdbId>
  implements CatalogEntryStore
{
  constructor() {
    super(new V0CatalogEntrySerializer());
  }

  async loadByHierarchyItemId(hierarchyItemId: HierarchyItemId) {
    return this.filter((f) => f.items.some((f) => f.equals(hierarchyItemId)));
  }
}
