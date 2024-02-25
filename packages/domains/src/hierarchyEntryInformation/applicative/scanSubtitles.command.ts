import {
  ApplicativeError,
  Command,
  CommandHandler,
  TransactionPerformer,
  useLog,
} from "@media-center/domain-driven";
import { HierarchyStore } from "../../fileWatcher/applicative/hierarchy.store";
import { HierarchyItemId } from "../../fileWatcher/domain/hierarchyItemId";
import { SubtitleService } from "./subtitle.service";

export class ScanSubtitlesCommand extends Command(HierarchyItemId) {}

class HierarchyItemNotFound extends ApplicativeError {
  constructor(hierarchyItemId: HierarchyItemId) {
    super(`Hierarchy item not found for id ${hierarchyItemId.toString()}`);
  }
}

export class ScanSubtitlesCommandHandler extends CommandHandler(
  ScanSubtitlesCommand,
) {
  constructor(
    private readonly transactionPerformer: TransactionPerformer,
    private readonly hierarchyStore: HierarchyStore,
    private readonly subtitleService: SubtitleService,
  ) {
    super();
  }

  static logger = useLog("ScanMissingSubtitles");

  async execute(intent: ScanSubtitlesCommand) {
    await this.transactionPerformer.transactionnally(async (transaction) => {
      const hierarchyItem = await this.hierarchyStore.load(
        intent.value,
        transaction,
      );
      if (!hierarchyItem) {
        throw new HierarchyItemNotFound(intent.value);
      }
      await this.subtitleService.extractFor(hierarchyItem, transaction);
    });
  }
}
