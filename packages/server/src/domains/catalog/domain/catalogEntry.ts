import { Multiple, Shape } from "../../../framework/shape";
import { HierarchyItemId } from "../../fileWatcher/domain/hierarchyItemId";
import { TmdbId } from "../../tmdb/domain/tmdbId";

export class CatalogEntryMovieSpecification extends Shape({
  id: HierarchyItemId,
}) {}

export class MovieCatalogEntry extends Shape({
  id: TmdbId,
  items: Multiple(CatalogEntryMovieSpecification),
}) {
  public addSpecification(specification: CatalogEntryMovieSpecification) {
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

export class CatalogEntryShowSpecification extends Shape({
  id: HierarchyItemId,
  season: Number,
  episode: Number,
}) {}

export class ShowCatalogEntry extends Shape({
  id: TmdbId,
  items: Multiple(CatalogEntryShowSpecification),
}) {
  public addSpecification(specification: CatalogEntryShowSpecification) {
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

export type AnyCatalogEntry = MovieCatalogEntry | ShowCatalogEntry;

export type AnyCatalogEntrySpecification =
  | CatalogEntryMovieSpecification
  | CatalogEntryShowSpecification;
