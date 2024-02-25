import {
  Command,
  CommandBus,
  CommandHandler,
} from "@media-center/domain-driven";
import { PromiseAllByChunk } from "@media-center/algorithm";
import { HierarchyStore } from "../../fileWatcher/applicative/hierarchy.store";
import { HierarchyEntryInformationStore } from "./hierarchyEntryInformation.store";
import { VideoFileService } from "./videoFile.service";
import { SubtitleStore } from "./subtitle.store";
import { ScanSubtitlesCommand } from "./scanSubtitles.command";

export class RescanSubtitlesCommand extends Command() {}

export class RescanSubtitlesCommandHandler extends CommandHandler(
  RescanSubtitlesCommand,
) {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly hierarchyStore: HierarchyStore,
    private readonly hierarchyEntryInformationStore: HierarchyEntryInformationStore,
    private readonly subtitleStore: SubtitleStore,
  ) {
    super();
  }

  async execute() {
    const all = await this.hierarchyStore.loadAll();
    await this.subtitleStore.deleteAll();
    await this.hierarchyEntryInformationStore.deleteAll();
    await PromiseAllByChunk(
      all,
      async (hierarchyItem) =>
        this.commandBus.execute(new ScanSubtitlesCommand(hierarchyItem.id)),
      1,
    );
  }
}
