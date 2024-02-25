import { Shape, Freeze } from "@media-center/domain-driven";
import { assertNever } from "@media-center/algorithm";
import { HierarchyItemId } from "../../fileWatcher/domain/hierarchyItemId";
import { TmdbId } from "../../tmdb/domain/tmdbId";

export class MovieCatalogEntryDataset extends Shape({
  hierarchyItemIds: [HierarchyItemId],
}) {
  has(hierarchyItemId: HierarchyItemId) {
    return Boolean(
      this.hierarchyItemIds.find((e) => e.equals(hierarchyItemId)),
    );
  }

  add(hierarchyItemId: HierarchyItemId) {
    if (this.has(hierarchyItemId)) {
      return;
    }
    this.hierarchyItemIds.push(hierarchyItemId);
  }

  delete(hierarchyItemId: HierarchyItemId) {
    const index = this.hierarchyItemIds.findIndex((e) =>
      e.equals(hierarchyItemId),
    );
    if (index >= 0) {
      this.hierarchyItemIds.splice(index, 1);
    }
  }
}

@Freeze()
export class MovieCatalogEntry extends Shape({
  id: TmdbId,
  updatedAt: Date,
  dataset: MovieCatalogEntryDataset,
}) {
  public addHierarchyItemId(hierarchyItemId: HierarchyItemId) {
    this.dataset.add(hierarchyItemId);
  }

  public deleteHierarchyItemId(hierarchyItemId: HierarchyItemId) {
    this.dataset.delete(hierarchyItemId);
  }

  public hasHierarchyItems() {
    return this.dataset.hierarchyItemIds.length > 0;
  }

  public markUpdated(date: Date) {
    this.updatedAt = date;
  }
}

export class ShowCatalogEntryDataset extends Shape({
  hierarchyItemIds: [HierarchyItemId],
  season: Number,
  episode: Number,
}) {
  has(hierarchyItemId: HierarchyItemId) {
    return Boolean(
      this.hierarchyItemIds.find((e) => e.equals(hierarchyItemId)),
    );
  }

  add(hierarchyItemId: HierarchyItemId) {
    if (this.has(hierarchyItemId)) {
      return;
    }
    this.hierarchyItemIds.push(hierarchyItemId);
  }

  delete(hierarchyItemId: HierarchyItemId) {
    const index = this.hierarchyItemIds.findIndex((e) =>
      e.equals(hierarchyItemId),
    );
    if (index >= 0) {
      this.hierarchyItemIds.splice(index, 1);
    }
  }
}

@Freeze()
export class ShowCatalogEntry extends Shape({
  id: TmdbId,
  updatedAt: Date,
  dataset: [ShowCatalogEntryDataset],
}) {
  public addHierarchyItemIdForEpisode(
    season: number,
    episode: number,
    hierarchyItemId: HierarchyItemId,
  ) {
    const exists = this.dataset.find(
      (e) => e.season === season && e.episode === episode,
    );
    if (exists) {
      exists.add(hierarchyItemId);
    } else {
      this.dataset.push(
        new ShowCatalogEntryDataset({
          season,
          episode,
          hierarchyItemIds: [hierarchyItemId],
        }),
      );
    }
  }

  public deleteHierarchyItemId(hierarchyItemId: HierarchyItemId) {
    for (const dataset of this.dataset) {
      dataset.delete(hierarchyItemId);
    }
  }

  public hasHierarchyItems() {
    return this.dataset.length > 0;
  }

  public markUpdated(date: Date) {
    this.updatedAt = date;
  }
}

export type AnyCatalogEntry = MovieCatalogEntry | ShowCatalogEntry;

export function CatalogEntryContainsHierarchyItemId(
  catalogEntry: AnyCatalogEntry,
  hierarchyItemId: HierarchyItemId,
) {
  if (catalogEntry instanceof MovieCatalogEntry) {
    return catalogEntry.dataset.hierarchyItemIds.some((id) =>
      id.equals(hierarchyItemId),
    );
  }
  if (catalogEntry instanceof ShowCatalogEntry) {
    return catalogEntry.dataset.some((entry) =>
      entry.hierarchyItemIds.some((id) => id.equals(hierarchyItemId)),
    );
  }
  assertNever(catalogEntry);
}

export type AnyCatalogEntryDataset =
  | MovieCatalogEntryDataset
  | ShowCatalogEntryDataset;
