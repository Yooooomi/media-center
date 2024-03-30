import {
  Either,
  Optional,
  Query,
  QueryHandler,
  Shape,
} from "@media-center/domain-driven";
import { assertNever, compact } from "@media-center/algorithm";
import { HierarchyItem } from "../fileWatcher/domain/hierarchyItem";
import { Movie } from "../tmdb/domain/movie";
import { Show } from "../tmdb/domain/show";
import { HierarchyStore } from "../fileWatcher/applicative/hierarchy.store";
import { CatalogEntryStore } from "../catalog/applicative/catalogEntry.store";
import {
  MovieCatalogEntry,
  ShowCatalogEntry,
} from "../catalog/domain/catalogEntry";
import { UserTmdbInfoStore } from "../userTmdbInfo/applicative/userTmdbInfo.store";
import { UserId, UserTmdbInfoId } from "../userTmdbInfo/domain/userTmdbInfoId";
import {
  UserTmdbMovieInfo,
  UserTmdbShowInfo,
} from "../userTmdbInfo/domain/userTmdbInfo";
import { TmdbStore } from "../tmdb/applicative/tmdb.store";
import { HierarchyItemId } from "../fileWatcher/domain/hierarchyItemId";

class WatchPlaylist extends Shape({
  index: Number,
  tmdb: Either(Movie, Show),
  playlist: [
    {
      hierarchyItem: HierarchyItem,
      progress: Number,
      season: Optional(Number),
      episode: Optional(Number),
    },
  ],
}) {}

export class WatchQuery extends Query(
  { actorId: UserId, hierarchyItemId: HierarchyItemId },
  WatchPlaylist,
) {}

export class WatchQueryHandler extends QueryHandler(WatchQuery) {
  constructor(
    private readonly tmdbStore: TmdbStore,
    private readonly catalogStore: CatalogEntryStore,
    private readonly userTmdbInfoStore: UserTmdbInfoStore,
    private readonly hierarchyStore: HierarchyStore,
  ) {
    super();
  }

  async execute(query: WatchQuery) {
    const [catalogEntry] = await this.catalogStore.loadByHierarchyItemId(
      query.hierarchyItemId,
    );

    if (!catalogEntry) {
      throw new Error("No catalog entry for this");
    }

    const tmdb = await this.tmdbStore.load(catalogEntry.id);

    if (!tmdb) {
      throw new Error("No tmdb was found");
    }

    const infos = await this.userTmdbInfoStore.load(
      new UserTmdbInfoId(query.actorId, tmdb.id),
    );

    if (catalogEntry instanceof MovieCatalogEntry) {
      const hierarchyItem = await this.hierarchyStore.load(
        query.hierarchyItemId,
      );
      if (infos !== undefined && !(infos instanceof UserTmdbMovieInfo)) {
        throw new Error("Stored progress for this is incompatible");
      }

      if (!hierarchyItem) {
        throw new Error("Could not find hierarchy item");
      }

      return new WatchPlaylist({
        index: 0,
        tmdb,
        playlist: [{ hierarchyItem, progress: infos?.progress ?? 0 }],
      });
    } else if (catalogEntry instanceof ShowCatalogEntry) {
      if (infos !== undefined && !(infos instanceof UserTmdbShowInfo)) {
        throw new Error("Stored progress for this is incompatible");
      }

      const requestedDatasetItem = catalogEntry.dataset.find((datasetItem) =>
        datasetItem.hierarchyItemIds.some((id) =>
          id.equals(query.hierarchyItemId),
        ),
      );

      if (!requestedDatasetItem) {
        throw new Error("Requested item is not in catalog entry");
      }

      const dataset = catalogEntry.getDatasetForSeason(
        requestedDatasetItem.season,
      );

      const hierarchyItemsIds = dataset.reduce<HierarchyItemId[]>(
        (acc, curr) => {
          const requested = curr.hierarchyItemIds.find((e) =>
            e.equals(query.hierarchyItemId),
          );
          const id = requested ?? curr.hierarchyItemIds[0];
          if (!id) {
            return acc;
          }
          acc.push(id);
          return acc;
        },
        [],
      );

      const hierarchyItems =
        await this.hierarchyStore.loadMany(hierarchyItemsIds);

      const startingIndex = hierarchyItems.findIndex((item) =>
        item.id.equals(query.hierarchyItemId),
      );

      if (startingIndex === -1) {
        throw new Error("Could not load wanted entry");
      }

      return new WatchPlaylist({
        index: startingIndex,
        tmdb,
        playlist: hierarchyItems.map((e) => {
          const datasetItem = dataset.find((d) => d.has(e.id));
          return {
            hierarchyItem: e,
            season: datasetItem?.season,
            episode: datasetItem?.episode,
            progress: datasetItem
              ? infos?.getEpisodeProgress(
                  datasetItem.season,
                  datasetItem.episode,
                ) ?? 0
              : 0,
          };
        }),
      });
    }

    assertNever(catalogEntry);
  }
}
