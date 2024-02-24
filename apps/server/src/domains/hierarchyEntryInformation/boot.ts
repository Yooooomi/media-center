import { Database, EventBus } from "@media-center/domain-driven";
import { EnvironmentHelper } from "@media-center/domains/src/environment/applicative/environmentHelper";
import { HierarchyEntryInformationSaga } from "@media-center/domains/src/hierarchyEntryInformation/applicative/hierarchyEntryInformation.saga";
import { FilesystemHierarchyEntryInformationStore } from "./infrastructure/filesystem.catalogEntryInformation.store";
import { InMemoryHierarchyEntryInformationStore } from "./infrastructure/inMemory.catalogEntryInformation.store";

export function bootHierarchyEntryInformation(
  environmentHelper: EnvironmentHelper,
  database: Database,
  eventBus: EventBus,
) {
  const hierarchyEntryInformationStore = environmentHelper.match(
    "DI_DATABASE",
    {
      memory: () => new InMemoryHierarchyEntryInformationStore(database),
      filesystem: () =>
        new FilesystemHierarchyEntryInformationStore(
          environmentHelper,
          database,
        ),
    },
  );

  new HierarchyEntryInformationSaga(hierarchyEntryInformationStore).listen(
    eventBus,
  );

  return { hierarchyEntryInformationStore };
}
