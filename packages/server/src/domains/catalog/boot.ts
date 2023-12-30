import {
  QueryBus,
  EventBus,
  InMemoryDatabase,
} from "@media-center/domain-driven";
import { EnvironmentHelper } from "../environment/applicative/environmentHelper";
import { HierarchyStore } from "../fileWatcher/applicative/hierarchy.store";
import { TmdbAPI } from "../tmdb/applicative/tmdb.api";
import { CatalogSaga } from "./applicative/catalog.saga";
import { GetEntriesQueryHandler } from "./applicative/getEntries.query";
import { GetEntryQueryHandler } from "./applicative/getEntry.query";
import { GetMovieEntriesQueryHandler } from "./applicative/getMovieEntries.query";
import { GetShowEntriesQueryHandler } from "./applicative/getShowEntries.query";
import { FilesystemCatalogEntryStore } from "./infrastructure/filesystem.catalogEntry.store";
import { InMemoryCatalogEntryStore } from "./infrastructure/inMemory.catalogEntry.store";

export function bootCatalog(
  database: InMemoryDatabase,
  queryBus: QueryBus,
  eventBus: EventBus,
  environmentHelper: EnvironmentHelper,
  tmdbApi: TmdbAPI,
  hierarchyItemStore: HierarchyStore
) {
  const catalogEntryStore = environmentHelper.match("DI_DATABASE", {
    memory: () => new InMemoryCatalogEntryStore(database),
    filesystem: () =>
      new FilesystemCatalogEntryStore(environmentHelper, database),
  });

  new CatalogSaga(tmdbApi, catalogEntryStore, eventBus).listen(eventBus);

  queryBus.register(
    new GetEntryQueryHandler(catalogEntryStore, hierarchyItemStore)
  );

  queryBus.register(
    new GetEntriesQueryHandler(catalogEntryStore, hierarchyItemStore)
  );

  queryBus.register(
    new GetMovieEntriesQueryHandler(catalogEntryStore, hierarchyItemStore)
  );

  queryBus.register(
    new GetShowEntriesQueryHandler(catalogEntryStore, hierarchyItemStore)
  );

  return { catalogEntryStore };
}
