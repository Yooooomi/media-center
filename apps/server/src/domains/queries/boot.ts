import { QueryBus } from "@media-center/domain-driven";
import { CatalogEntryStore } from "@media-center/domains/src/catalog/applicative/catalogEntry.store";
import { HierarchyStore } from "@media-center/domains/src/fileWatcher/applicative/hierarchy.store";
import { HierarchyEntryInformationStore } from "@media-center/domains/src/hierarchyEntryInformation/applicative/hierarchyEntryInformation.store";
import { DiscoverPageQueryHandler } from "@media-center/domains/src/queries/discoverPage.query";
import { GetMoviePageQueryHandler } from "@media-center/domains/src/queries/getMoviePage.query";
import { GetMoviesPageQueryHandler } from "@media-center/domains/src/queries/getMoviesPage.query";
import { GetShowPageQueryHandler } from "@media-center/domains/src/queries/getShowPage.query";
import { GetShowsPageQueryHandler } from "@media-center/domains/src/queries/getShowsPage.query";
import { HomepageQueryHandler } from "@media-center/domains/src/queries/homepage.query";
import { SettingsPageQueryHandler } from "@media-center/domains/src/queries/settingsPage.query";
import { StatusQueryHandler } from "@media-center/domains/src/queries/status.query";
import { TmdbAPI } from "@media-center/domains/src/tmdb/applicative/tmdb.api";
import { TmdbStore } from "@media-center/domains/src/tmdb/applicative/tmdb.store";
import { TorrentClient } from "@media-center/domains/src/torrentClient/applicative/torrentClient";
import { TorrentIndexer } from "@media-center/domains/src/torrentIndexer/applicative/torrentIndexer";
import { TorrentRequestStore } from "@media-center/domains/src/torrentRequest/applicative/torrentRequest.store";
import { UserTmdbInfoStore } from "@media-center/domains/src/userTmdbInfo/applicative/userTmdbInfo.store";

export function bootQueries(
  queryBus: QueryBus,
  catalogEntryStore: CatalogEntryStore,
  torrentRequestStore: TorrentRequestStore,
  tmdbStore: TmdbStore,
  tmdbApi: TmdbAPI,
  hierarchyStore: HierarchyStore,
  userTmdbInfoStore: UserTmdbInfoStore,
  torrentClient: TorrentClient,
  torrentIndexer: TorrentIndexer,
  hierarchyEntryInformationStore: HierarchyEntryInformationStore,
) {
  queryBus.register(
    new HomepageQueryHandler(
      catalogEntryStore,
      torrentRequestStore,
      userTmdbInfoStore,
      tmdbStore,
    ),
  );

  queryBus.register(
    new GetMoviePageQueryHandler(
      tmdbStore,
      tmdbApi,
      torrentRequestStore,
      catalogEntryStore,
      hierarchyStore,
      userTmdbInfoStore,
      hierarchyEntryInformationStore,
    ),
  );

  queryBus.register(
    new GetShowPageQueryHandler(
      tmdbStore,
      tmdbApi,
      torrentRequestStore,
      catalogEntryStore,
      hierarchyStore,
      userTmdbInfoStore,
      hierarchyEntryInformationStore,
    ),
  );

  queryBus.register(
    new SettingsPageQueryHandler(hierarchyStore, catalogEntryStore),
  );

  queryBus.register(
    new GetMoviesPageQueryHandler(catalogEntryStore, tmdbStore),
  );

  queryBus.register(new GetShowsPageQueryHandler(catalogEntryStore, tmdbStore));

  queryBus.register(new DiscoverPageQueryHandler(tmdbApi));

  queryBus.register(new StatusQueryHandler(torrentClient, torrentIndexer));
}
