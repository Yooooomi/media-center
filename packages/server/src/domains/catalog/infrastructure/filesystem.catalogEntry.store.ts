import { ShapeSerializer, Either } from "@media-center/domain-driven";
import { FilesystemStore } from "../../../framework/store";
import { HierarchyItemId } from "../../fileWatcher/domain/hierarchyItemId";
import { TmdbId } from "../../tmdb/domain/tmdbId";
import { CatalogEntryStore } from "../applicative/catalogEntry.store";
import {
  AnyCatalogEntry,
  MovieCatalogEntry,
  ShowCatalogEntry,
} from "../domain/catalogEntry";

export class FilesystemCatalogEntryStore
  extends FilesystemStore<AnyCatalogEntry, TmdbId>
  implements CatalogEntryStore
{
  constructor() {
    super(new ShapeSerializer(Either(MovieCatalogEntry, ShowCatalogEntry)));
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
