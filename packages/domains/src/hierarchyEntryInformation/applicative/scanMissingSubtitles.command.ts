import {
  Command,
  CommandBus,
  CommandHandler,
  useLog,
} from "@media-center/domain-driven";
import { keyBy } from "@media-center/algorithm";
import { HierarchyStore } from "../../fileWatcher/applicative/hierarchy.store";
import { HierarchyEntryInformation } from "../domain/hierarchyEntryInformation";
import { HierarchyEntryInformationStore } from "./hierarchyEntryInformation.store";
import { ScanSubtitlesCommand } from "./scanSubtitles.command";

export class ScanMissingSubtitlesCommand extends Command() {}

export class ScanMissingSubtitlesCommandHandler extends CommandHandler(
  ScanMissingSubtitlesCommand,
) {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly hierarchyStore: HierarchyStore,
    private readonly hierarchyEntryInformationStore: HierarchyEntryInformationStore,
  ) {
    super();
  }

  static logger = useLog("ScanMissingSubtitles");

  async execute() {
    const allHierarchyItems = await this.hierarchyStore.loadAll();
    const allInfo = keyBy(
      await this.hierarchyEntryInformationStore.loadAll(),
      (info) => info.id.toString(),
    );

    const updated: HierarchyEntryInformation[] = [];
    for (const hierarchyItem of allHierarchyItems) {
      const info = allInfo[hierarchyItem.id.toString()];
      if (info) {
        continue;
      }
      ScanMissingSubtitlesCommandHandler.logger.info(
        `Missing hierarchy item info for ${hierarchyItem.file.path}`,
      );
      await this.commandBus.execute(new ScanSubtitlesCommand(hierarchyItem.id));
    }
  }
}
