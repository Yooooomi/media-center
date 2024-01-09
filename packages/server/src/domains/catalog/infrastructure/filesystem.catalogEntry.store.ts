import {
  Either,
  InMemoryDatabase,
  InMemoryTransaction,
  SerializableSerializer,
} from "@media-center/domain-driven";
import { HierarchyItemId } from "../../fileWatcher/domain/hierarchyItemId";
import { CatalogEntryStore } from "../applicative/catalogEntry.store";
import {
  AnyCatalogEntry,
  MovieCatalogEntry,
  ShowCatalogEntry,
} from "../domain/catalogEntry";
import { FilesystemStore } from "../../../framework/store";
import { EnvironmentHelper } from "../../environment/applicative/environmentHelper";

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
    return this.filter(
      (f) => f.items.some((f) => f.id.equals(hierarchyItemId)),
      transaction
    );
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
