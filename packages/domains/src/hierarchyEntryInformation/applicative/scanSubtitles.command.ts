import {
  ApplicativeError,
  Command,
  CommandHandler,
  EventBus,
  TransactionPerformer,
  useLog,
} from "@media-center/domain-driven";
import { HierarchyStore } from "../../fileWatcher/applicative/hierarchy.store";
import { HierarchyItemId } from "../../fileWatcher/domain/hierarchyItemId";
import { HierarchyEntryInformationUpdated } from "../domain/hierarchyEntryInformation.events";
import { VideoFileService } from "./videoFile.service";

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
    private readonly eventBus: EventBus,
    private readonly hierarchyStore: HierarchyStore,
    private readonly videoFileService: VideoFileService,
  ) {
    super();
  }

  static logger = useLog("ScanMissingSubtitles");

  async execute(intent: ScanSubtitlesCommand) {
    const hierarchyEntryInformation =
      await this.transactionPerformer.transactionnally(async (transaction) => {
        const hierarchyItem = await this.hierarchyStore.load(
          intent.value,
          transaction,
        );
        if (!hierarchyItem) {
          throw new HierarchyItemNotFound(intent.value);
        }
        return await this.videoFileService.extractFor(
          hierarchyItem,
          transaction,
        );
      });
    this.eventBus.publish(
      new HierarchyEntryInformationUpdated({
        hierarchyItemId: hierarchyEntryInformation.id,
      }),
    );
  }
}
