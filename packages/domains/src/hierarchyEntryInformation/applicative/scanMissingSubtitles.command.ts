import {
  Command,
  CommandHandler,
  EventBus,
  TransactionPerformer,
  useLog,
} from "@media-center/domain-driven";
import { keyBy } from "@media-center/algorithm";
import { HierarchyStore } from "../../fileWatcher/applicative/hierarchy.store";
import { HierarchyEntryInformation } from "../domain/hierarchyEntryInformation";
import { HierarchyEntryInformationUpdated } from "../domain/hierarchyEntryInformation.events";
import { HierarchyEntryInformationStore } from "./hierarchyEntryInformation.store";
import { VideoFileService } from "./videoFile.service";

export class ScanMissingSubtitlesCommand extends Command() {}

export class ScanMissingSubtitlesCommandHandler extends CommandHandler(
  ScanMissingSubtitlesCommand,
) {
  constructor(
    private readonly transactionPerformer: TransactionPerformer,
    private readonly eventBus: EventBus,
    private readonly hierarchyStore: HierarchyStore,
    private readonly hierarchyEntryInformationStore: HierarchyEntryInformationStore,
    private readonly videoFileService: VideoFileService,
  ) {
    super();
  }

  static logger = useLog("ScanMissingSubtitles");

  async execute() {
    const hierarchyEntryInformation =
      await this.transactionPerformer.transactionnally(async (transaction) => {
        const allHierarchyItems =
          await this.hierarchyStore.loadAll(transaction);
        const allInfo = keyBy(
          await this.hierarchyEntryInformationStore.loadAll(transaction),
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
          updated.push(
            await this.videoFileService.extractFor(hierarchyItem, transaction),
          );
        }
        return updated;
      });
    hierarchyEntryInformation.forEach((item) =>
      this.eventBus.publish(
        new HierarchyEntryInformationUpdated({
          hierarchyItemId: item.id,
        }),
      ),
    );
  }
}
