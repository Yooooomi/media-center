import {
  CommandBus,
  Database,
  EventBus,
  QueryBus,
  TransactionPerformer,
} from "@media-center/domain-driven";
import { EnvironmentHelper } from "@media-center/domains/src/environment/applicative/environmentHelper";
import { HierarchyEntryInformationSaga } from "@media-center/domains/src/hierarchyEntryInformation/applicative/hierarchyEntryInformation.saga";
import { GetSubtitlesQueryHandler } from "@media-center/domains/src/hierarchyEntryInformation/applicative/getSubtitles.query";
import { RescanSubtitlesCommandHandler } from "@media-center/domains/src/hierarchyEntryInformation/applicative/rescanSubtitles.command";
import { SubtitleService } from "@media-center/domains/src/hierarchyEntryInformation/applicative/subtitle.service";
import { HierarchyStore } from "@media-center/domains/src/fileWatcher/applicative/hierarchy.store";
import { ScanMissingSubtitlesCommandHandler } from "@media-center/domains/src/hierarchyEntryInformation/applicative/scanMissingSubtitles.command";
import { ScanSubtitlesCommandHandler } from "@media-center/domains/src/hierarchyEntryInformation/applicative/scanSubtitles.command";
import { FilesystemHierarchyEntryInformationStore } from "./infrastructure/filesystem.catalogEntryInformation.store";
import { InMemoryHierarchyEntryInformationStore } from "./infrastructure/inMemory.catalogEntryInformation.store";
import { FilesystemSubtitleStore } from "./infrastructure/filesystem.subtitleStore";

export function bootHierarchyEntryInformation(
  environmentHelper: EnvironmentHelper,
  transactionPerformer: TransactionPerformer,
  database: Database,
  eventBus: EventBus,
  commandBus: CommandBus,
  queryBus: QueryBus,
  hierarchyStore: HierarchyStore,
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

  const subtitleStore = new FilesystemSubtitleStore(environmentHelper);
  const subtitleService = new SubtitleService(
    hierarchyEntryInformationStore,
    subtitleStore,
  );

  new HierarchyEntryInformationSaga(hierarchyStore, subtitleService).listen(
    eventBus,
  );

  queryBus.register(
    new GetSubtitlesQueryHandler(hierarchyEntryInformationStore, subtitleStore),
  );

  commandBus.register(
    new RescanSubtitlesCommandHandler(
      transactionPerformer,
      hierarchyStore,
      hierarchyEntryInformationStore,
      subtitleStore,
      subtitleService,
    ),
  );

  commandBus.register(
    new ScanMissingSubtitlesCommandHandler(
      transactionPerformer,
      hierarchyStore,
      hierarchyEntryInformationStore,
      subtitleService,
    ),
  );

  commandBus.register(
    new ScanSubtitlesCommandHandler(
      transactionPerformer,
      hierarchyStore,
      subtitleService,
    ),
  );

  return { hierarchyEntryInformationStore };
}
