import { InMemoryTransaction, Store } from "@media-center/domain-driven";
import { HierarchyItemId } from "../../fileWatcher/domain/hierarchyItemId";
import {
  AnyCatalogEntry,
  MovieCatalogEntry,
  ShowCatalogEntry,
} from "../domain/catalogEntry";

export abstract class CatalogEntryStore extends Store<AnyCatalogEntry> {
  abstract loadByHierarchyItemId(
    hierarchyItemId: HierarchyItemId,
    transaction?: InMemoryTransaction,
  ): Promise<AnyCatalogEntry[]>;

  abstract loadMovies(): Promise<MovieCatalogEntry[]>;
  abstract loadShows(): Promise<ShowCatalogEntry[]>;
  abstract loadNewestMovies(limit: number): Promise<MovieCatalogEntry[]>;
  abstract loadNewestShows(limit: number): Promise<ShowCatalogEntry[]>;
}
