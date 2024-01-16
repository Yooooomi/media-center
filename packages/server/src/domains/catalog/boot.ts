import {
  QueryBus,
  EventBus,
  CommandBus,
  Database,
  TransactionPerformer,
} from "@media-center/domain-driven";
import { EnvironmentHelper } from "../environment/applicative/environmentHelper";
import { HierarchyStore } from "../fileWatcher/applicative/hierarchy.store";
import { TmdbAPI } from "../tmdb/applicative/tmdb.api";
import { CatalogSaga } from "./applicative/catalog.saga";
import { GetMovieEntriesQueryHandler } from "./applicative/getMovieEntries.query";
import { GetShowEntriesQueryHandler } from "./applicative/getShowEntries.query";
import { FilesystemCatalogEntryStore } from "./infrastructure/filesystem.catalogEntry.store";
import { InMemoryCatalogEntryStore } from "./infrastructure/inMemory.catalogEntry.store";
import { TmdbStore } from "../tmdb/applicative/tmdb.store";
import { ReinitCatalogCommandHandler } from "./applicative/reinit.command";

export function bootCatalog(
  database: Database,
  transactionPerformer: TransactionPerformer,
  queryBus: QueryBus,
  commandBus: CommandBus,
  eventBus: EventBus,
  environmentHelper: EnvironmentHelper,
  tmdbApi: TmdbAPI,
  tmdbStore: TmdbStore,
  hierarchyItemStore: HierarchyStore
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
    eventBus
  ).listen(eventBus);

  queryBus.register(
    new GetMovieEntriesQueryHandler(catalogEntryStore, hierarchyItemStore)
  );

  queryBus.register(
    new GetShowEntriesQueryHandler(catalogEntryStore, hierarchyItemStore)
  );

  commandBus.register(
    new ReinitCatalogCommandHandler(
      eventBus,
      transactionPerformer,
      catalogEntryStore,
      hierarchyItemStore
    )
  );

  return { catalogEntryStore };
}
