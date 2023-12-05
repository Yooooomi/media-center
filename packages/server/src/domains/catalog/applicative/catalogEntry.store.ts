import { Store } from "../../../framework/store";
import { HierarchyItemId } from "../../fileWatcher/domain/hierarchyItemId";
import { TmdbId } from "../../tmdb/domain/tmdbId";
import {
  AnyCatalogEntry,
  MovieCatalogEntry,
  ShowCatalogEntry,
} from "../domain/catalogEntry";

export abstract class CatalogEntryStore extends Store<AnyCatalogEntry, TmdbId> {
  abstract loadByHierarchyItemId(
    hierarchyItemId: HierarchyItemId
  ): Promise<AnyCatalogEntry[]>;

  abstract loadMovies(): Promise<MovieCatalogEntry[]>;
  abstract loadShows(): Promise<ShowCatalogEntry[]>;
}
