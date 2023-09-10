import { ApplicativeError } from "../../../framework/error";
import { Query, QueryHandler } from "../../../framework/query";
import { Multiple, Shape } from "../../../framework/shape";
import { HierarchyStore } from "../../fileWatcher/applicative/hierarchy.store";
import { HierarchyItem } from "../../fileWatcher/domain/hierarchyItem";
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

export class GetEntryQuery extends Query({
  needing: Shape({
    tmdbId: TmdbId,
  }),
  returningMaybeOne: CatalogEntryFulfilled,
}) {}

export class GetEntryQueryHandler extends QueryHandler(GetEntryQuery) {
  constructor(
    private readonly catalogEntryStore: CatalogEntryStore,
    private readonly hierarchyItemStore: HierarchyStore
  ) {
    super();
  }

  async execute(query: GetEntryQuery) {
    const entry = await this.catalogEntryStore.load(query.data.tmdbId);

    if (!entry) {
      return undefined;
    }

    const items = await this.hierarchyItemStore.loadMany(
      entry.items.map((i) => i.id)
    );

    console.log("Returning with id", query.data.tmdbId);
    return new CatalogEntryFulfilled({
      id: query.data.tmdbId,
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
  }
}
