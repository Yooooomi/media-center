import {
  ApplicativeError,
  Query,
  Either,
  QueryHandler,
} from "@media-center/domain-driven";
import { HierarchyStore } from "../../fileWatcher/applicative/hierarchy.store";
import { HierarchyItemId } from "../../fileWatcher/domain/hierarchyItemId";
import { MovieCatalogEntry, ShowCatalogEntry } from "../domain/catalogEntry";
import { CatalogEntryStore } from "./catalogEntry.store";
import {
  CatalogEntryMovieSpecificationFulFilled,
  CatalogEntryShowSpecificationFulFilled,
  MovieCatalogEntryFulfilled,
  ShowCatalogEntryFulfilled,
} from "./catalogEntryFulfilled.front";

class UnknownEntry extends ApplicativeError {
  constructor(name: string) {
    super(`Unknown entry type ${name}`);
  }
}

class NotMatchingHierarchyItem extends ApplicativeError {
  constructor(id: HierarchyItemId) {
    super(`Did not find matching hierary item ${id}`);
  }
}

export class GetEntriesQuery extends Query(undefined, [
  Either(ShowCatalogEntryFulfilled, MovieCatalogEntryFulfilled),
]) {}

export class GetEntriesQueryHandler extends QueryHandler(GetEntriesQuery) {
  constructor(
    private readonly catalogEntryStore: CatalogEntryStore,
    private readonly hierarchyItemStore: HierarchyStore
  ) {
    super();
  }

  async execute() {
    const entries = await this.catalogEntryStore.loadAll();

    const ids = new Set<string>();
    entries.forEach((entry) => {
      entry.items.flatMap((i) => i.id).forEach((i) => ids.add(i.toString()));
    });
    const items = await this.hierarchyItemStore.loadMany(
      [...ids.values()].map((i) => new HierarchyItemId(i))
    );

    return entries.map((entry) => {
      if (entry instanceof ShowCatalogEntry) {
        return new ShowCatalogEntryFulfilled({
          id: entry.id,
          items: entry.items.map((e) => {
            const item = items.find((i) => {
              return i.id.equals(e.id);
            });
            if (!item) {
              throw new NotMatchingHierarchyItem(e.id);
            }
            return new CatalogEntryShowSpecificationFulFilled({
              item,
              season: e.season,
              episode: e.episode,
            });
          }),
        });
      } else if (entry instanceof MovieCatalogEntry) {
        return new MovieCatalogEntryFulfilled({
          id: entry.id,
          items: entry.items.map((e) => {
            const item = items.find((i) => {
              return i.id.equals(e.id);
            });
            if (!item) {
              throw new NotMatchingHierarchyItem(e.id);
            }
            return new CatalogEntryMovieSpecificationFulFilled({
              item,
            });
          }),
        });
      }
      throw new UnknownEntry((entry as any).constructor.name);
    });
  }
}
