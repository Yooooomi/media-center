import { Multiple, Shape } from "../../../framework/shape";
import { HierarchyItemId } from "../../fileWatcher/domain/hierarchyItemId";
import { TmdbId } from "../../tmdb/domain/tmdbId";

export class CatalogEntryMovieSpecification extends Shape({
  id: HierarchyItemId,
}) {}

export class CatalogEntryShowSpecification extends Shape({
  id: HierarchyItemId,
  season: Number,
  episode: Number,
}) {}

export type AnyCatalogEntrySpecification =
  | CatalogEntryMovieSpecification
  | CatalogEntryShowSpecification;

export class CatalogEntry extends Shape({
  id: TmdbId,
  items: Multiple(CatalogEntryMovieSpecification, CatalogEntryShowSpecification),
}) {
  public addSpecification(specification: AnyCatalogEntrySpecification) {
    if (this.items.some((f) => f.id.equals(specification.id))) {
      return;
    }
    this.items.push(specification);
  }

  public deleteHierarchyItemId(hierarchyItemId: HierarchyItemId) {
    const index = this.items.findIndex((f) => f.id.equals(hierarchyItemId));
    if (index < 0) {
      return;
    }
    this.items.splice(index, 1);
  }
}
