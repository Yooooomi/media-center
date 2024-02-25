import {
  Command,
  CommandHandler,
  TransactionPerformer,
  useLog,
} from "@media-center/domain-driven";
import { keyBy } from "@media-center/algorithm";
import { HierarchyStore } from "../../fileWatcher/applicative/hierarchy.store";
import { HierarchyEntryInformationStore } from "./hierarchyEntryInformation.store";
import { SubtitleService } from "./subtitle.service";

export class ScanMissingSubtitlesCommand extends Command() {}

export class ScanMissingSubtitlesCommandHandler extends CommandHandler(
  ScanMissingSubtitlesCommand,
) {
  constructor(
    private readonly transactionPerformer: TransactionPerformer,
    private readonly hierarchyStore: HierarchyStore,
    private readonly hierarchyEntryInformationStore: HierarchyEntryInformationStore,
    private readonly subtitleService: SubtitleService,
  ) {
    super();
  }

  static logger = useLog("ScanMissingSubtitles");

  async execute() {
    await this.transactionPerformer.transactionnally(async (transaction) => {
      const allHierarchyItems = await this.hierarchyStore.loadAll(transaction);
      const allInfo = keyBy(
        await this.hierarchyEntryInformationStore.loadAll(transaction),
        (info) => info.id.toString(),
      );

      for (const hierarchyItem of allHierarchyItems) {
        const info = allInfo[hierarchyItem.id.toString()];
        if (info) {
          continue;
        }
        ScanMissingSubtitlesCommandHandler.logger.info(
          `Missing hierarchy item info for ${hierarchyItem.file.path}`,
        );
        await this.subtitleService.extractFor(hierarchyItem, transaction);
      }
    });
  }
}
