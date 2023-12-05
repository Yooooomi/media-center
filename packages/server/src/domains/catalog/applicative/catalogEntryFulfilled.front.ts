import { Shape, Multiple } from "../../../framework/shape";
import { HierarchyItem } from "../../fileWatcher/domain/hierarchyItem";
import { TmdbId } from "../../tmdb/domain/tmdbId";

export class CatalogEntryMovieSpecificationFulFilled extends Shape({
  item: HierarchyItem,
}) {}

export class CatalogEntryShowSpecificationFulFilled extends Shape({
  item: HierarchyItem,
  season: Number,
  episode: Number,
}) {}

export class ShowCatalogEntryFulfilled extends Shape({
  id: TmdbId,
  items: Multiple(CatalogEntryShowSpecificationFulFilled),
}) {
  getLatestItem() {
    const [firstItem] = this.items;
    if (!firstItem) {
      return undefined;
    }
    let max = firstItem;
    for (let i = 1; i < this.items.length; i += 1) {
      const item = this.items[i];
      if (!item) {
        continue;
      }
      if (item.item.addedAt.getTime() < max.item.addedAt.getTime()) {
        max = item;
      }
    }
    return max;
  }
}

export class MovieCatalogEntryFulfilled extends Shape({
  id: TmdbId,
  items: Multiple(CatalogEntryMovieSpecificationFulFilled),
}) {
  getLatestItem() {
    const [firstItem] = this.items;
    if (!firstItem) {
      return undefined;
    }
    let max = firstItem;
    for (let i = 1; i < this.items.length; i += 1) {
      const item = this.items[i];
      if (!item) {
        continue;
      }
      if (item.item.addedAt.getTime() < max.item.addedAt.getTime()) {
        max = item;
      }
    }
    return max;
  }
}
