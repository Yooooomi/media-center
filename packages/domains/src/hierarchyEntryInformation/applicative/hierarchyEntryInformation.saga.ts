import { CommandBus, Saga } from "@media-center/domain-driven";
import {
  HierarchyItemAdded,
  HierarchyItemDeleted,
} from "../../fileWatcher/applicative/fileWatcher.events";
import { HierarchyStore } from "../../fileWatcher/applicative/hierarchy.store";
import { TorrentRequestUpdated } from "../../torrentRequest/domain/torrentRequest.events";
import { TorrentRequestStore } from "../../torrentRequest/applicative/torrentRequest.store";
import { CatalogEntryStore } from "../../catalog/applicative/catalogEntry.store";
import { VideoFileService } from "./videoFile.service";
import { ScanSubtitlesForModifiedFileCommand } from "./scanSubtitlesForModifiedFile.command";
import { HierarchyEntryInformationStore } from "./hierarchyEntryInformation.store";

export class HierarchyEntryInformationSaga extends Saga {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly hierarchyStore: HierarchyStore,
    private readonly catalogEntryStore: CatalogEntryStore,
    private readonly videoFileService: VideoFileService,
    private readonly torrentRequestStore: TorrentRequestStore,
    private readonly hierarchyEntryInformationStore: HierarchyEntryInformationStore,
  ) {
    super();
  }

  @Saga.on(HierarchyItemAdded)
  private async initializeHierarchyEntryInformation(event: HierarchyItemAdded) {
    const item = await this.hierarchyStore.load(event.item.id);

    if (!item) {
      return;
    }

    const hierarchyEntryInformation =
      await this.videoFileService.extractFor(item);
    // TODO transaction
    await this.hierarchyEntryInformationStore.save(hierarchyEntryInformation);
  }

  @Saga.on(HierarchyItemDeleted)
  private async deleteHierarchyEntryInformation(event: HierarchyItemDeleted) {
    await this.videoFileService.deleteFor(event.item.id);
  }

  // I dont want to bother saving this in database
  // If the server restarts it will rescan the torrents between 10 and 100%
  // But it's not important
  private checkedAfterPercent: Record<string, "percent" | "finished"> = {};

  // Refresh ffmpeg metadata after 10% and 100%
  @Saga.on(TorrentRequestUpdated)
  private async scanAtBeginningAndEndOfDownload(event: TorrentRequestUpdated) {
    const request = await this.torrentRequestStore.load(event.torrentRequestId);
    if (!request) {
      return;
    }
    if (request.downloaded < 0.1 && request.downloaded !== 1) {
      return;
    }
    const requestIdString = request.id.toString();
    const finished = request.downloaded === 1;
    const checkType = finished ? "finished" : "percent";
    const storedCheckType = this.checkedAfterPercent[requestIdString];
    if (checkType && checkType === storedCheckType) {
      return;
    }
    this.checkedAfterPercent[requestIdString] = checkType;
    await this.commandBus.execute(
      new ScanSubtitlesForModifiedFileCommand(event.tmdbId),
    );
  }
}
