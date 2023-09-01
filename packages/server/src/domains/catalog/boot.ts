import { EventBus } from "../../framework/event/eventBus";
import { QueryBus } from "../../framework/queryBus/queryBus";
import { HierarchyStore } from "../fileWatcher/applicative/hierarchy.store";
import { TmdbAPI } from "../tmdb/applicative/tmdb.api";
import { CatalogSaga } from "./applicative/catalog.saga";
import {
  GetEntryQuery,
  GetEntryQueryHandler,
} from "./applicative/getEntry.query";
import { InMemoryCatalogEntryStore } from "./infrastructure/inMemory.catalogEntry.store";

export function bootCatalog(
  queryBus: QueryBus,
  eventBus: EventBus,
  tmdbApi: TmdbAPI,
  hierarchyItemStore: HierarchyStore
) {
  const catalogEntryStore = new InMemoryCatalogEntryStore();

  new CatalogSaga(tmdbApi, catalogEntryStore).listen(eventBus);

  queryBus.register(
    GetEntryQuery,
    new GetEntryQueryHandler(catalogEntryStore, hierarchyItemStore)
  );

  return { catalogEntryStore };
}
