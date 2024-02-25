import {
  Command,
  CommandHandler,
  EventBus,
  TransactionPerformer,
} from "@media-center/domain-driven";
import { PromiseAllByChunk } from "@media-center/algorithm";
import { HierarchyStore } from "../../fileWatcher/applicative/hierarchy.store";
import { HierarchyEntryInformation } from "../domain/hierarchyEntryInformation";
import { HierarchyEntryInformationUpdated } from "../domain/hierarchyEntryInformation.events";
import { HierarchyEntryInformationStore } from "./hierarchyEntryInformation.store";
import { VideoFileService } from "./videoFile.service";
import { SubtitleStore } from "./subtitle.store";

export class RescanSubtitlesCommand extends Command() {}

export class RescanSubtitlesCommandHandler extends CommandHandler(
  RescanSubtitlesCommand,
) {
  constructor(
    private readonly transactionPerformer: TransactionPerformer,
    private readonly eventBus: EventBus,
    private readonly hierarchyStore: HierarchyStore,
    private readonly hierarchyEntryInformationStore: HierarchyEntryInformationStore,
    private readonly subtitleStore: SubtitleStore,
    private readonly videoFileService: VideoFileService,
  ) {
    super();
  }

  async execute() {
    const hierarchyEntryInformation =
      await this.transactionPerformer.transactionnally(async (transaction) => {
        const all = await this.hierarchyStore.loadAll(transaction);
        await this.subtitleStore.deleteAll();
        await this.hierarchyEntryInformationStore.deleteAll(transaction);
        const allHierarchyEntryInfo = await PromiseAllByChunk(
          all,
          async (info) =>
            await this.videoFileService.extractFor(info, transaction),
          1,
        );
        return allHierarchyEntryInfo
          .filter((e): e is { result: HierarchyEntryInformation; error: any } =>
            Boolean(e.result),
          )
          .map((e) => e.result);
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
