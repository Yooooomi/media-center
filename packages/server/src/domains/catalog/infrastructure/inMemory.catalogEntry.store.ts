import {
  InMemoryStore,
  Either,
  SerializableSerializer,
} from "@media-center/domain-driven";
import { HierarchyItemId } from "../../fileWatcher/domain/hierarchyItemId";
import { CatalogEntryStore } from "../applicative/catalogEntry.store";
import {
  AnyCatalogEntry,
  MovieCatalogEntry,
  ShowCatalogEntry,
} from "../domain/catalogEntry";

export class InMemoryCatalogEntryStore
  extends InMemoryStore<AnyCatalogEntry>
  implements CatalogEntryStore
{
  constructor() {
    super(
      new SerializableSerializer(Either(MovieCatalogEntry, ShowCatalogEntry))
    );
  }

  loadByHierarchyItemId(hierarchyItemId: HierarchyItemId) {
    return this.filter((f) =>
      f.items.some((f) => f.id.equals(hierarchyItemId))
    );
  }

  loadMovies() {
    return this.filter((f) => f instanceof MovieCatalogEntry) as Promise<
      MovieCatalogEntry[]
    >;
  }

  loadShows() {
    return this.filter((f) => f instanceof ShowCatalogEntry) as Promise<
      ShowCatalogEntry[]
    >;
  }
}
