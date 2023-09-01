import { HierarchyItemId } from "../../fileWatcher/domain/hierarchyItemId";
import { TmdbId } from "../../tmdb/domain/tmdbId";

export class CatalogEntry {
  constructor(
    public readonly id: TmdbId,
    public readonly items: HierarchyItemId[]
  ) {}

  public addHierarchyItemId(hierarchyItemId: HierarchyItemId) {
    if (this.items.some((f) => f.equals(hierarchyItemId))) {
      return;
    }
    this.items.push(hierarchyItemId);
  }

  public deleteHierarchyItemId(hierarchyItemId: HierarchyItemId) {
    const index = this.items.findIndex((f) => f.equals(hierarchyItemId));
    if (index < 0) {
      return;
    }
    this.items.splice(index, 1);
  }
}
