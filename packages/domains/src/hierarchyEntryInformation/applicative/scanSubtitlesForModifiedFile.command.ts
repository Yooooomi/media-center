import {
  ApplicativeError,
  Command,
  CommandBus,
  CommandHandler,
} from "@media-center/domain-driven";
import { keyBy } from "@media-center/algorithm";
import { TmdbId } from "../../tmdb/domain/tmdbId";
import { CatalogEntryStore } from "../../catalog/applicative/catalogEntry.store";
import { HierarchyStore } from "../../fileWatcher/applicative/hierarchy.store";
import { Filesystem } from "../../miscellaneous/valueObjects/fileSystem";
import { HierarchyEntryInformationStore } from "./hierarchyEntryInformation.store";
import { ScanSubtitlesCommand } from "./scanSubtitles.command";

export class ScanSubtitlesForModifiedFileCommand extends Command(TmdbId) {}

class CatalogEntryNotFound extends ApplicativeError {
  constructor(id: TmdbId) {
    super(`Catalog entry not found for ${id.toString()}`);
  }
}

export class ScanSubtitlesForModifiedFileCommandHandler extends CommandHandler(
  ScanSubtitlesForModifiedFileCommand,
) {
  constructor(
    private readonly catalogEntryStore: CatalogEntryStore,
    private readonly hierarchyEntryStore: HierarchyStore,
    private readonly hierarchyEntryInformationStore: HierarchyEntryInformationStore,
    private readonly filesystem: Filesystem,
    private readonly commandBus: CommandBus,
  ) {
    super();
  }

  async execute(intent: ScanSubtitlesForModifiedFileCommand) {
    const catalogEntry = await this.catalogEntryStore.load(intent.value);

    if (!catalogEntry) {
      throw new CatalogEntryNotFound(intent.value);
    }

    const hierachyEntryIds = catalogEntry.getHierarchyItemIds();
    const hierarchyEntries = keyBy(
      await this.hierarchyEntryStore.loadMany(hierachyEntryIds),
      (e) => e.id.toString(),
    );
    const informations =
      await this.hierarchyEntryInformationStore.loadMany(hierachyEntryIds);

    for (const information of informations) {
      const hierarchyEntry = hierarchyEntries[information.id.toString()];
      if (!hierarchyEntry) {
        continue;
      }
      const fileSize = await this.filesystem.fileSize(hierarchyEntry.file);
      if (fileSize === information.checkedAtFileSize) {
        continue;
      }
      console.log(
        "File size changed for",
        hierarchyEntry.file.getFilenameWithExtension(),
      );
      await this.commandBus.execute(
        new ScanSubtitlesCommand(hierarchyEntry.id),
      );
    }
  }
}
