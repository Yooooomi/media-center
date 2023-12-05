import { EventBus } from "../../framework/event/eventBus";
import { QueryBus } from "../../framework/queryBus/queryBus";
import { EnvironmentHelper } from "../environment/applicative/environmentHelper";
import { HierarchyStore } from "../fileWatcher/applicative/hierarchy.store";
import { TmdbAPI } from "../tmdb/applicative/tmdb.api";
import { CatalogSaga } from "./applicative/catalog.saga";
import {
  GetEntriesQuery,
  GetEntriesQueryHandler,
} from "./applicative/getEntries.query";
import {
  GetEntryQuery,
  GetEntryQueryHandler,
} from "./applicative/getEntry.query";
import {
  GetMovieEntriesQuery,
  GetMovieEntriesQueryHandler,
} from "./applicative/getMovieEntries.query";
import {
  GetShowEntriesQuery,
  GetShowEntriesQueryHandler,
} from "./applicative/getShowEntries.query";
import { FilesystemCatalogEntryStore } from "./infrastructure/filesystem.catalogEntry.store";
import { InMemoryCatalogEntryStore } from "./infrastructure/inMemory.catalogEntry.store";

export function bootCatalog(
  queryBus: QueryBus,
  eventBus: EventBus,
  environmentHelper: EnvironmentHelper,
  tmdbApi: TmdbAPI,
  hierarchyItemStore: HierarchyStore
) {
  const catalogEntryStore = environmentHelper.match("DI_DATABASE", {
    memory: () => new InMemoryCatalogEntryStore(),
    filesystem: () => new FilesystemCatalogEntryStore(),
  });

  new CatalogSaga(tmdbApi, catalogEntryStore).listen(eventBus);

  queryBus.register(
    GetEntryQuery,
    new GetEntryQueryHandler(catalogEntryStore, hierarchyItemStore)
  );

  queryBus.register(
    GetEntriesQuery,
    new GetEntriesQueryHandler(catalogEntryStore, hierarchyItemStore)
  );

  queryBus.register(
    GetMovieEntriesQuery,
    new GetMovieEntriesQueryHandler(catalogEntryStore, hierarchyItemStore)
  );

  queryBus.register(
    GetShowEntriesQuery,
    new GetShowEntriesQueryHandler(catalogEntryStore, hierarchyItemStore)
  );

  return { catalogEntryStore };
}
