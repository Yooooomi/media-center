import {
  Command,
  CommandHandler,
  TransactionPerformer,
} from "@media-center/domain-driven";
import { PromiseAllByChunk } from "@media-center/algorithm";
import { HierarchyStore } from "../../fileWatcher/applicative/hierarchy.store";
import { HierarchyEntryInformationStore } from "./hierarchyEntryInformation.store";
import { SubtitleService } from "./subtitle.service";
import { SubtitleStore } from "./subtitle.store";

export class RescanSubtitlesCommand extends Command() {}

export class RescanSubtitlesCommandHandler extends CommandHandler(
  RescanSubtitlesCommand,
) {
  constructor(
    private readonly transactionPerformer: TransactionPerformer,
    private readonly hierarchyStore: HierarchyStore,
    private readonly hierarchyEntryInformationStore: HierarchyEntryInformationStore,
    private readonly subtitleStore: SubtitleStore,
    private readonly subtitleService: SubtitleService,
  ) {
    super();
  }

  async execute() {
    await this.transactionPerformer.transactionnally(async (transaction) => {
      const all = await this.hierarchyStore.loadAll(transaction);
      await this.subtitleStore.deleteAll();
      await this.hierarchyEntryInformationStore.deleteAll(transaction);
      await PromiseAllByChunk(
        all,
        async (info) => {
          await this.subtitleService.extractFor(info, transaction);
        },
        1,
      );
    });
  }
}
