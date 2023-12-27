import { QueryBus } from "@media-center/domain-driven";
import { HomepageQuery, HomepageQueryHandler } from "./homepage.query";
import { CatalogEntryStore } from "../domains/catalog/applicative/catalogEntry.store";
import { TorrentRequestStore } from "../domains/torrentRequest/applicative/torrentRequest.store";
import { TmdbStore } from "../domains/tmdb/applicative/tmdb.store";
import {
  GetMoviePageQuery,
  GetMoviePageQueryHandler,
} from "./getMoviePage.query";
import { TmdbAPI } from "../domains/tmdb/applicative/tmdb.api";
import { HierarchyStore } from "../domains/fileWatcher/applicative/hierarchy.store";
import { GetShowPageQuery, GetShowPageQueryHandler } from "./getShowPage.query";

export function bootQueries(
  queryBus: QueryBus,
  catalogEntryStore: CatalogEntryStore,
  torrentRequestStore: TorrentRequestStore,
  tmdbStore: TmdbStore,
  tmdbApi: TmdbAPI,
  hierarchyStore: HierarchyStore
) {
  queryBus.register(
    HomepageQuery,
    new HomepageQueryHandler(catalogEntryStore, torrentRequestStore, tmdbStore)
  );

  queryBus.register(
    GetMoviePageQuery,
    new GetMoviePageQueryHandler(
      tmdbStore,
      tmdbApi,
      torrentRequestStore,
      catalogEntryStore,
      hierarchyStore
    )
  );

  queryBus.register(
    GetShowPageQuery,
    new GetShowPageQueryHandler(
      tmdbStore,
      tmdbApi,
      torrentRequestStore,
      catalogEntryStore,
      hierarchyStore
    )
  );
}
