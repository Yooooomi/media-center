import {
  ApplicativeError,
  Command,
  CommandHandler,
  EventBus,
  TransactionPerformer,
} from "@media-center/domain-driven";
import { HierarchyStore } from "../../fileWatcher/applicative/hierarchy.store";
import { HierarchyItemId } from "../../fileWatcher/domain/hierarchyItemId";
import { HierarchyEntryInformationUpdated } from "../domain/hierarchyEntryInformation.events";
import { VideoFileService } from "./videoFile.service";
import { HierarchyEntryInformationStore } from "./hierarchyEntryInformation.store";

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
    private readonly hierarchyEntryInformationStore: HierarchyEntryInformationStore,
  ) {
    super();
  }

  async execute(intent: ScanSubtitlesCommand) {
    const hierarchyItem = await this.hierarchyStore.load(intent.value);
    if (!hierarchyItem) {
      throw new HierarchyItemNotFound(intent.value);
    }
    const entryInformation =
      await this.videoFileService.extractFor(hierarchyItem);

    await this.transactionPerformer.transactionnally(async (transaction) => {
      const item = await this.hierarchyStore.load(intent.value, transaction);
      if (!item) {
        return;
      }
      await this.hierarchyEntryInformationStore.save(
        entryInformation,
        transaction,
      );
    });

    this.eventBus.publish(
      new HierarchyEntryInformationUpdated({
        hierarchyItemId: entryInformation.id,
      }),
    );
  }
}
