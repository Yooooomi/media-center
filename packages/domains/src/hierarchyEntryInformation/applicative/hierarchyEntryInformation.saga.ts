import { Saga } from "@media-center/domain-driven";
import {
  HierarchyItemAdded,
  HierarchyItemDeleted,
} from "../../fileWatcher/applicative/fileWatcher.events";
import { HierarchyStore } from "../../fileWatcher/applicative/hierarchy.store";
import { SubtitleService } from "./subtitle.service";

export class HierarchyEntryInformationSaga extends Saga {
  constructor(
    private readonly hierarchyStore: HierarchyStore,
    private readonly subtitleService: SubtitleService,
  ) {
    super();
  }

  @Saga.on(HierarchyItemAdded)
  private async initializeHierarchyEntryInformation(event: HierarchyItemAdded) {
    const item = await this.hierarchyStore.load(event.item.id);

    if (!item) {
      return;
    }

    await this.subtitleService.extractFor(item);
  }

  @Saga.on(HierarchyItemDeleted)
  private async deleteHierarchyEntryInformation(event: HierarchyItemDeleted) {
    await this.subtitleService.deleteFor(event.item.id);
  }
}
