import { Query, QueryHandler, Shape } from "@media-center/domain-driven";
import { Show } from "../domains/tmdb/domain/show";
import { TorrentRequest } from "../domains/torrentRequest/domain/torrentRequest";
import {
  CatalogEntryShowSpecificationFulFilled,
  ShowCatalogEntryFulfilled,
} from "../domains/catalog/applicative/catalogEntryFulfilled.front";
import { TmdbId } from "../domains/tmdb/domain/tmdbId";
import { TmdbStore } from "../domains/tmdb/applicative/tmdb.store";
import { TorrentRequestStore } from "../domains/torrentRequest/applicative/torrentRequest.store";
import { CatalogEntryStore } from "../domains/catalog/applicative/catalogEntry.store";
import { HierarchyStore } from "../domains/fileWatcher/applicative/hierarchy.store";
import { ShowCatalogEntry } from "../domains/catalog/domain/catalogEntry";
import { keyBy } from "@media-center/algorithm";
import { ShowSeason } from "../domains/tmdb/domain/showSeason";
import { TmdbAPI } from "../domains/tmdb/applicative/tmdb.api";
import {
  CatalogEntryDeleted,
  CatalogEntryUpdated,
} from "../domains/catalog/applicative/catalog.events";

class ShowPageSummary extends Shape({
  tmdb: Show,
  requests: [TorrentRequest],
  catalogEntry: ShowCatalogEntryFulfilled,
  seasons: [ShowSeason],
}) {}

export class GetShowPageQuery extends Query(TmdbId, ShowPageSummary) {}

export class GetShowPageQueryHandler extends QueryHandler(GetShowPageQuery, [
  CatalogEntryUpdated,
  CatalogEntryDeleted,
]) {
  constructor(
    private readonly tmdbStore: TmdbStore,
    private readonly tmdbApi: TmdbAPI,
    private readonly torrentRequestStore: TorrentRequestStore,
    private readonly catalogEntryStore: CatalogEntryStore,
    private readonly hierarchyStore: HierarchyStore
  ) {
    super();
  }

  shouldReact(
    event: CatalogEntryUpdated | CatalogEntryDeleted,
    intent: GetShowPageQuery
  ) {
    return event.catalogEntry.id.equals(intent.value);
  }

  async execute(intention: GetShowPageQuery): Promise<ShowPageSummary> {
    const tmdb = await this.tmdbStore.load(intention.value);

    if (!tmdb || !(tmdb instanceof Show)) {
      throw new Error("Cannot load Show TMDB");
    }

    const requests = await this.torrentRequestStore.loadByTmdbId(
      intention.value
    );
    const catalogEntry = await this.catalogEntryStore.load(intention.value);

    if (catalogEntry && !(catalogEntry instanceof ShowCatalogEntry)) {
      throw new Error("Invalid CatalogShowEntry");
    }
    const showSpecifications = catalogEntry?.items ?? [];
    const hierarchyItems = keyBy(
      catalogEntry
        ? await this.hierarchyStore.loadMany(
            showSpecifications.map((e) => e.id)
          )
        : [],
      (e) => e.id.toString()
    );
    const catalogEntryFulfilled = new ShowCatalogEntryFulfilled({
      id: intention.value,
      items: showSpecifications.map((showSpecification) => {
        const fulfilled = hierarchyItems[showSpecification.id.toString()];
        if (!fulfilled) {
          throw new Error("Cannot find fulfilled hierarchy item");
        }
        return new CatalogEntryShowSpecificationFulFilled({
          item: fulfilled,
          episode: showSpecification.episode,
          season: showSpecification.season,
        });
      }),
    });

    const seasons = await this.tmdbApi.getSeasons(intention.value);

    return new ShowPageSummary({
      tmdb,
      requests,
      catalogEntry: catalogEntryFulfilled,
      seasons,
    });
  }
}
