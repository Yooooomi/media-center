import { ApplicativeError } from "../../../framework/error";
import { Query, QueryHandler } from "../../../framework/query";
import { Multiple, Optional, Shape } from "../../../framework/shape";
import { HierarchyStore } from "../../fileWatcher/applicative/hierarchy.store";
import { HierarchyItem } from "../../fileWatcher/domain/hierarchyItem";
import { HierarchyItemId } from "../../fileWatcher/domain/hierarchyItemId";
import { TmdbId } from "../../tmdb/domain/tmdbId";
import {
  CatalogEntryMovieSpecification,
  CatalogEntryShowSpecification,
} from "../domain/catalogEntry";
import { CatalogEntryStore } from "./catalogEntry.store";

class CatalogEntryMovieSpecificationFulFilled extends Shape({
  item: HierarchyItem,
}) {}

class CatalogEntryShowSpecificationFulFilled extends Shape({
  item: HierarchyItem,
  season: Number,
  episode: Number,
}) {}

export class CatalogEntryFulfilled extends Shape({
  id: TmdbId,
  items: Multiple(
    CatalogEntryMovieSpecificationFulFilled,
    CatalogEntryShowSpecificationFulFilled
  ),
}) {}

class UnknownEntry extends ApplicativeError {
  constructor(name: string) {
    super(`Unknown entry type ${name}`);
  }
}

export class GetEntriesQuery extends Query({
  returningMany: CatalogEntryFulfilled,
}) {}

export class GetEntriesQueryHandler extends QueryHandler(GetEntriesQuery) {
  constructor(
    private readonly catalogEntryStore: CatalogEntryStore,
    private readonly hierarchyItemStore: HierarchyStore
  ) {
    super();
  }

  async execute(query: GetEntriesQuery) {
    const entries = await this.catalogEntryStore.loadAll();

    const ids = new Set<string>();
    entries.forEach((entry) => {
      ids.add(entry.id.toString());
    });
    const items = await this.hierarchyItemStore.loadMany(
      [...ids.values()].map((i) => new HierarchyItemId(i))
    );

    return entries.map((entry) => {
      return new CatalogEntryFulfilled({
        id: entry.id,
        items: entry.items.map((e, i) => {
          if (e instanceof CatalogEntryMovieSpecification) {
            return new CatalogEntryMovieSpecificationFulFilled({
              item: items[i]!,
            });
          } else if (e instanceof CatalogEntryShowSpecification) {
            return new CatalogEntryShowSpecificationFulFilled({
              item: items[i]!,
              season: e.season,
              episode: e.episode,
            });
          }
          throw new UnknownEntry((e as any).constructor.name);
        }),
      });
    });
  }
}
