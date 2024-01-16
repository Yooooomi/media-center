import {
  InMemoryStore,
  Either,
  SerializableSerializer,
  InMemoryDatabase,
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
  constructor(database: InMemoryDatabase) {
    super(
      database,
      "catalogEntry",
      new SerializableSerializer(Either(MovieCatalogEntry, ShowCatalogEntry))
    );
  }

  loadByHierarchyItemId(hierarchyItemId: HierarchyItemId) {
    return this.filter((f) => {
      if (f instanceof MovieCatalogEntry) {
        return f.dataset.has(hierarchyItemId);
      } else if (f instanceof ShowCatalogEntry) {
        return f.dataset.some((dataset) => dataset.has(hierarchyItemId));
      }
      return false;
    });
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

  async loadNewestMovies(limit: number) {
    return (await this.loadAll())
      .filter((e): e is MovieCatalogEntry => e instanceof MovieCatalogEntry)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, limit);
  }

  async loadNewestShows(limit: number) {
    return (await this.loadAll())
      .filter((e): e is ShowCatalogEntry => e instanceof ShowCatalogEntry)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, limit);
  }
}
