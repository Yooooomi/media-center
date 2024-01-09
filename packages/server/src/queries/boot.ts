import { QueryBus } from "@media-center/domain-driven";
import { HomepageQueryHandler } from "./homepage.query";
import { CatalogEntryStore } from "../domains/catalog/applicative/catalogEntry.store";
import { TorrentRequestStore } from "../domains/torrentRequest/applicative/torrentRequest.store";
import { TmdbStore } from "../domains/tmdb/applicative/tmdb.store";
import { GetMoviePageQueryHandler } from "./getMoviePage.query";
import { TmdbAPI } from "../domains/tmdb/applicative/tmdb.api";
import { HierarchyStore } from "../domains/fileWatcher/applicative/hierarchy.store";
import { GetShowPageQueryHandler } from "./getShowPage.query";
import { UserTmdbInfoStore } from "../domains/userTmdbInfo/applicative/userTmdbInfo.store";
import { SettingsPageQueryHandler } from "./settingsPage.query";
import { GetMoviesPageQueryHandler } from "./getMoviesPage.query";
import { GetShowsPageQueryHandler } from "./getShowsPage.query";
import { DiscoverPageQueryHandler } from "./discoverPage.query";

export function bootQueries(
  queryBus: QueryBus,
  catalogEntryStore: CatalogEntryStore,
  torrentRequestStore: TorrentRequestStore,
  tmdbStore: TmdbStore,
  tmdbApi: TmdbAPI,
  hierarchyStore: HierarchyStore,
  userTmdbInfoStore: UserTmdbInfoStore
) {
  queryBus.register(
    new HomepageQueryHandler(
      catalogEntryStore,
      torrentRequestStore,
      userTmdbInfoStore,
      tmdbStore
    )
  );

  queryBus.register(
    new GetMoviePageQueryHandler(
      tmdbStore,
      tmdbApi,
      torrentRequestStore,
      catalogEntryStore,
      hierarchyStore,
      userTmdbInfoStore
    )
  );

  queryBus.register(
    new GetShowPageQueryHandler(
      tmdbStore,
      tmdbApi,
      torrentRequestStore,
      catalogEntryStore,
      hierarchyStore,
      userTmdbInfoStore
    )
  );

  queryBus.register(
    new SettingsPageQueryHandler(hierarchyStore, catalogEntryStore)
  );

  queryBus.register(
    new GetMoviesPageQueryHandler(catalogEntryStore, tmdbStore)
  );

  queryBus.register(new GetShowsPageQueryHandler(catalogEntryStore, tmdbStore));

  queryBus.register(new DiscoverPageQueryHandler(tmdbApi));
}
