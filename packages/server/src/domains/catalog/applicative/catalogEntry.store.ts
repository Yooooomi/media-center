import { Store } from "@media-center/domain-driven";
import { HierarchyItemId } from "../../fileWatcher/domain/hierarchyItemId";
import { TmdbId } from "../../tmdb/domain/tmdbId";
import {
  AnyCatalogEntry,
  MovieCatalogEntry,
  ShowCatalogEntry,
} from "../domain/catalogEntry";

export abstract class CatalogEntryStore extends Store<AnyCatalogEntry> {
  abstract loadByHierarchyItemId(
    hierarchyItemId: HierarchyItemId
  ): Promise<AnyCatalogEntry[]>;

  abstract loadMovies(): Promise<MovieCatalogEntry[]>;
  abstract loadShows(): Promise<ShowCatalogEntry[]>;
}
