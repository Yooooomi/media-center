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
import { VideoFileService } from "@media-center/domains/src/hierarchyEntryInformation/applicative/videoFile.service";
import { HierarchyStore } from "@media-center/domains/src/fileWatcher/applicative/hierarchy.store";
import { ScanMissingSubtitlesCommandHandler } from "@media-center/domains/src/hierarchyEntryInformation/applicative/scanMissingSubtitles.command";
import { ScanSubtitlesCommandHandler } from "@media-center/domains/src/hierarchyEntryInformation/applicative/scanSubtitles.command";
import { Filesystem } from "@media-center/domains/src/miscellaneous/valueObjects/fileSystem";
import { CatalogEntryStore } from "@media-center/domains/src/catalog/applicative/catalogEntry.store";
import { TorrentRequestStore } from "@media-center/domains/src/torrentRequest/applicative/torrentRequest.store";
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
  filesystem: Filesystem,
  catalogEntryStore: CatalogEntryStore,
  torrentRequestStore: TorrentRequestStore,
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
  const videoFileService = new VideoFileService(
    hierarchyEntryInformationStore,
    subtitleStore,
    filesystem,
  );

  new HierarchyEntryInformationSaga(
    commandBus,
    hierarchyStore,
    catalogEntryStore,
    videoFileService,
    torrentRequestStore,
  ).listen(eventBus);

  queryBus.register(
    new GetSubtitlesQueryHandler(hierarchyEntryInformationStore, subtitleStore),
  );

  commandBus.register(
    new RescanSubtitlesCommandHandler(
      commandBus,
      hierarchyStore,
      hierarchyEntryInformationStore,
      subtitleStore,
    ),
  );

  commandBus.register(
    new ScanMissingSubtitlesCommandHandler(
      commandBus,
      hierarchyStore,
      hierarchyEntryInformationStore,
    ),
  );

  commandBus.register(
    new ScanSubtitlesCommandHandler(
      transactionPerformer,
      eventBus,
      hierarchyStore,
      videoFileService,
    ),
  );

  return { hierarchyEntryInformationStore };
}
