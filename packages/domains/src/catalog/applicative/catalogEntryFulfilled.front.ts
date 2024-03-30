import { Shape } from "@media-center/domain-driven";
import { maxBy, minBy, uniqBy } from "@media-center/algorithm";
import { HierarchyItem } from "../../fileWatcher/domain/hierarchyItem";
import { TmdbId } from "../../tmdb/domain/tmdbId";

export class MovieCatalogEntryDatasetFulfilled extends Shape({
  hierarchyItems: [HierarchyItem],
}) {
  equals(other: unknown) {
    return (
      other instanceof MovieCatalogEntryDatasetFulfilled &&
      this.hierarchyItems.every((item, index) =>
        item.equals(other.hierarchyItems[index]),
      )
    );
  }

  getLatestItem() {
    const [firstItem] = this.hierarchyItems;
    if (!firstItem) {
      return undefined;
    }
    let max = firstItem;
    for (let i = 1; i < this.hierarchyItems.length; i += 1) {
      const item = this.hierarchyItems[i];
      if (!item) {
        continue;
      }
      if (item.addedAt.getTime() < max.addedAt.getTime()) {
        max = item;
      }
    }
    return max;
  }
}

export class ShowCatalogEntryDatasetFulfilled extends Shape({
  hierarchyItems: [HierarchyItem],
  season: Number,
  episode: Number,
}) {
  equals(other: unknown) {
    return (
      other instanceof ShowCatalogEntryDatasetFulfilled &&
      this.season === other.season &&
      this.episode === other.episode &&
      this.hierarchyItems.every((item, index) =>
        item.equals(other.hierarchyItems[index]),
      )
    );
  }

  getLatestItem() {
    const [firstItem] = this.hierarchyItems;
    if (!firstItem) {
      return undefined;
    }
    let max = firstItem;
    for (let i = 1; i < this.hierarchyItems.length; i += 1) {
      const item = this.hierarchyItems[i];
      if (!item) {
        continue;
      }
      if (item.addedAt.getTime() < max.addedAt.getTime()) {
        max = item;
      }
    }
    return max;
  }
}

export class ShowCatalogEntryFulfilled extends Shape({
  id: TmdbId,
  dataset: [ShowCatalogEntryDatasetFulfilled],
}) {
  numberOfUniqueEpisodes() {
    return uniqBy(this.dataset, (i) => i.episode.toString()).length;
  }

  availableSeasons() {
    return [...new Set(this.dataset.map((e) => e.season)).values()];
  }

  getFirstAvailableSeason() {
    return minBy(this.dataset, (item) => item.season);
  }

  getEpisodesOfSeason(season: number) {
    return this.dataset
      .filter((item) => item.season === season)
      .sort((a, b) => a.episode - b.episode);
  }

  getEpisode(season: number, episode: number) {
    return this.dataset.filter(
      (item) => item.season === season && item.episode === episode,
    );
  }

  hasHierarchyItems() {
    return this.dataset.length > 0;
  }

  getHierarchyItemForEpisode(season: number, episode: number) {
    return this.dataset
      .find((e) => e.season === season && e.episode === episode)
      ?.getLatestItem();
  }
}

export class MovieCatalogEntryFulfilled extends Shape({
  id: TmdbId,
  dataset: MovieCatalogEntryDatasetFulfilled,
}) {
  getLatestItem() {
    return this.dataset.getLatestItem();
  }

  hasHierarchyItems() {
    return this.dataset.hierarchyItems.length > 0;
  }
}
