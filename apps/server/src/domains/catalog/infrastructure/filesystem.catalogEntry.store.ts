import {
  Either,
  InMemoryDatabase,
  InMemoryTransaction,
  SerializableSerializer,
} from "@media-center/domain-driven";
import { FilesystemStore } from "../../../framework/store";
import { CatalogEntryStore } from "@media-center/domains/src/catalog/applicative/catalogEntry.store";
import {
  AnyCatalogEntry,
  MovieCatalogEntry,
  ShowCatalogEntry,
} from "@media-center/domains/src/catalog/domain/catalogEntry";
import { EnvironmentHelper } from "@media-center/domains/src/environment/applicative/environmentHelper";
import { HierarchyItemId } from "@media-center/domains/src/fileWatcher/domain/hierarchyItemId";

export class FilesystemCatalogEntryStore
  extends FilesystemStore<AnyCatalogEntry>
  implements CatalogEntryStore
{
  constructor(
    environmentHelper: EnvironmentHelper,
    database: InMemoryDatabase
  ) {
    super(
      environmentHelper,
      database,
      "catalogEntry",
      new SerializableSerializer(Either(MovieCatalogEntry, ShowCatalogEntry))
    );
  }

  loadByHierarchyItemId(
    hierarchyItemId: HierarchyItemId,
    transaction?: InMemoryTransaction
  ) {
    return this.filter((f) => {
      if (f instanceof MovieCatalogEntry) {
        return f.dataset.has(hierarchyItemId);
      } else if (f instanceof ShowCatalogEntry) {
        return f.dataset.some((dataset) => dataset.has(hierarchyItemId));
      }
      return false;
    });
  }

  loadMovies(transaction?: InMemoryTransaction) {
    return this.filter(
      (f) => f instanceof MovieCatalogEntry,
      transaction
    ) as Promise<MovieCatalogEntry[]>;
  }

  loadShows(transaction?: InMemoryTransaction) {
    return this.filter(
      (f) => f instanceof ShowCatalogEntry,
      transaction
    ) as Promise<ShowCatalogEntry[]>;
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
