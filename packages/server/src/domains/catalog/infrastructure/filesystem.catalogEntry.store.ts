import { DefinitionSerializer, Either } from "@media-center/domain-driven";
import { FilesystemStore } from "../../../framework/store";
import { HierarchyItemId } from "../../fileWatcher/domain/hierarchyItemId";
import { CatalogEntryStore } from "../applicative/catalogEntry.store";
import {
  AnyCatalogEntry,
  MovieCatalogEntry,
  ShowCatalogEntry,
} from "../domain/catalogEntry";

export class FilesystemCatalogEntryStore
  extends FilesystemStore<AnyCatalogEntry>
  implements CatalogEntryStore
{
  constructor() {
    super(
      new DefinitionSerializer(Either(MovieCatalogEntry, ShowCatalogEntry))
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
