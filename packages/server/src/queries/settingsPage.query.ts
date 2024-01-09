import { Query, QueryHandler, Shape } from "@media-center/domain-driven";
import { HierarchyStore } from "../domains/fileWatcher/applicative/hierarchy.store";
import { CatalogEntryStore } from "../domains/catalog/applicative/catalogEntry.store";

class SettingsPageSummary extends Shape({
  hierarchyItems: Number,
  catalogEntries: Number,
}) {}

export class SettingsPageQuery extends Query(undefined, SettingsPageSummary) {}

export class SettingsPageQueryHandler extends QueryHandler(SettingsPageQuery) {
  constructor(
    private readonly hierarchyStore: HierarchyStore,
    private readonly catalogEntryStore: CatalogEntryStore
  ) {
    super();
  }

  async execute() {
    const hierarchyCount = await this.hierarchyStore.countAll();
    const catalogEntryCount = await this.catalogEntryStore.countAll();

    return new SettingsPageSummary({
      hierarchyItems: hierarchyCount,
      catalogEntries: catalogEntryCount,
    });
  }
}
