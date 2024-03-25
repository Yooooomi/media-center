import * as path from "path";
import * as os from "os";
import { Transaction, useLog } from "@media-center/domain-driven";
import { HierarchyItemId } from "../../fileWatcher/domain/hierarchyItemId";
import { HierarchyEntryInformation } from "../domain/hierarchyEntryInformation";
import { HierarchyItem } from "../../fileWatcher/domain/hierarchyItem";
import { Filesystem } from "../../miscellaneous/valueObjects/fileSystem";
import { HierarchyEntryInformationStore } from "./hierarchyEntryInformation.store";
import { SubtitleStore } from "./subtitle.store";
import { extractTracksFromPath } from "./ffmpeg";

export class VideoFileService {
  constructor(
    private readonly hierarchyEntryInformationStore: HierarchyEntryInformationStore,
    private readonly subtitleStore: SubtitleStore,
    private readonly filesystem: Filesystem,
  ) {}

  static logger = useLog(VideoFileService.name);

  static generateFilepathFromIndex(
    hierarchyItemId: HierarchyItemId,
    index: number,
  ) {
    return path.join(os.tmpdir(), `${hierarchyItemId.toString()}-${index}.vtt`);
  }

  public async extractFor(hierarchyItem: HierarchyItem) {
    VideoFileService.logger.info(
      `Extracting metadata for ${hierarchyItem.file.getFilenameWithExtension()}`,
    );
    const { videoTrack, audioTracks, textTracks } = await extractTracksFromPath(
      hierarchyItem.file.path,
      (index) =>
        VideoFileService.generateFilepathFromIndex(hierarchyItem.id, index),
    );
    await Promise.all(
      textTracks.map((_, index) =>
        this.subtitleStore.fromLocalFile(
          hierarchyItem.id,
          index,
          VideoFileService.generateFilepathFromIndex(hierarchyItem.id, index),
        ),
      ),
    );
    const fileSize = await this.filesystem.fileSize(hierarchyItem.file);
    const entryInformation = new HierarchyEntryInformation({
      id: hierarchyItem.id,
      checkedAtFileSize: fileSize,
      videoTrack,
      textTracks,
      audioTracks,
    });
    VideoFileService.logger.info(
      `Extracted metadata for ${hierarchyItem.file.getFilenameWithExtension()} ${audioTracks.length} audio tracks, ${textTracks.length} text tracks`,
    );
    return entryInformation;
  }

  async deleteFor(hierarchyItemId: HierarchyItemId, transaction?: Transaction) {
    const hierarchyEntryInformation =
      await this.hierarchyEntryInformationStore.load(
        hierarchyItemId,
        transaction,
      );
    if (!hierarchyEntryInformation) {
      VideoFileService.logger.warn(
        "Could not find hierarchy entry information, some subtitles might still exist",
      );
      return;
    }
    await Promise.all(
      hierarchyEntryInformation.textTracks.map((_, index) =>
        this.subtitleStore.delete(hierarchyItemId, index),
      ),
    );
    await this.hierarchyEntryInformationStore.delete(
      hierarchyItemId,
      transaction,
    );
  }
}
