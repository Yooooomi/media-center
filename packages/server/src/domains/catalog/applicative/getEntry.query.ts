import { Query } from "../../../framework/query";
import { QueryHandler } from "../../../framework/queryHandler";
import { Shape } from "../../../framework/shape";
import { HierarchyStore } from "../../fileWatcher/applicative/hierarchy.store";
import { HierarchyItem } from "../../fileWatcher/domain/hierarchyItem";
import { TmdbId } from "../../tmdb/domain/tmdbId";
import { CatalogEntryStore } from "./catalogEntry.store";

export class CatalogEntryFulfilled extends Shape({
  id: TmdbId,
  items: [HierarchyItem],
}) {}
CatalogEntryFulfilled.register();

export class GetEntryQuery extends Query<CatalogEntryFulfilled | undefined> {
  constructor(public readonly tmdbId: TmdbId) {
    super();
  }
}

export class GetEntryQueryHandler extends QueryHandler<GetEntryQuery> {
  constructor(
    private readonly catalogEntryStore: CatalogEntryStore,
    private readonly hierarchyItemStore: HierarchyStore
  ) {
    super();
  }

  async execute(query: GetEntryQuery) {
    const entry = await this.catalogEntryStore.load(query.tmdbId);

    if (!entry) {
      return undefined;
    }

    const items = await this.hierarchyItemStore.loadMany(entry.items);

    return new CatalogEntryFulfilled({
      id: query.tmdbId,
      items,
    });
  }
}
