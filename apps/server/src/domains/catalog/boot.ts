import {
  QueryBus,
  EventBus,
  CommandBus,
  Database,
  TransactionPerformer,
} from "@media-center/domain-driven";
import { EnvironmentHelper } from "@media-center/domains/src/environment/applicative/environmentHelper";
import { TmdbAPI } from "@media-center/domains/src/tmdb/applicative/tmdb.api";
import { TmdbStore } from "@media-center/domains/src/tmdb/applicative/tmdb.store";
import { HierarchyStore } from "@media-center/domains/src/fileWatcher/applicative/hierarchy.store";
import { CatalogSaga } from "@media-center/domains/src/catalog/applicative/catalog.saga";
import { GetMovieEntriesQueryHandler } from "@media-center/domains/src/catalog/applicative/getMovieEntries.query";
import { GetShowEntriesQueryHandler } from "@media-center/domains/src/catalog/applicative/getShowEntries.query";
import { ReinitCatalogCommandHandler } from "@media-center/domains/src/catalog/applicative/reinit.command";
import { InMemoryCatalogEntryStore } from "./infrastructure/inMemory.catalogEntry.store";
import { FilesystemCatalogEntryStore } from "./infrastructure/filesystem.catalogEntry.store";

export function bootCatalog(
  database: Database,
  transactionPerformer: TransactionPerformer,
  queryBus: QueryBus,
  commandBus: CommandBus,
  eventBus: EventBus,
  environmentHelper: EnvironmentHelper,
  tmdbApi: TmdbAPI,
  tmdbStore: TmdbStore,
  hierarchyItemStore: HierarchyStore,
) {
  const catalogEntryStore = environmentHelper.match("DI_DATABASE", {
    memory: () => new InMemoryCatalogEntryStore(database),
    filesystem: () =>
      new FilesystemCatalogEntryStore(environmentHelper, database),
  });

  new CatalogSaga(
    transactionPerformer,
    tmdbApi,
    tmdbStore,
    catalogEntryStore,
    eventBus,
  ).listen(eventBus);

  queryBus.register(
    new GetMovieEntriesQueryHandler(catalogEntryStore, hierarchyItemStore),
  );

  queryBus.register(
    new GetShowEntriesQueryHandler(catalogEntryStore, hierarchyItemStore),
  );

  commandBus.register(
    new ReinitCatalogCommandHandler(
      eventBus,
      transactionPerformer,
      catalogEntryStore,
      hierarchyItemStore,
    ),
  );

  return { catalogEntryStore };
}
