import { ShapeSerializer } from "../../../framework/shape";
import { InMemoryStore } from "../../../framework/store";
import { HierarchyItemId } from "../../fileWatcher/domain/hierarchyItemId";
import { TmdbId } from "../../tmdb/domain/tmdbId";
import { CatalogEntryStore } from "../applicative/catalogEntry.store";
import { CatalogEntry } from "../domain/catalogEntry";

export class InMemoryCatalogEntryStore
  extends InMemoryStore<CatalogEntry, TmdbId>
  implements CatalogEntryStore
{
  constructor() {
    super(new ShapeSerializer(CatalogEntry));
  }

  async loadByHierarchyItemId(hierarchyItemId: HierarchyItemId) {
    return this.filter((f) =>
      f.items.some((f) => f.id.equals(hierarchyItemId))
    );
  }
}
