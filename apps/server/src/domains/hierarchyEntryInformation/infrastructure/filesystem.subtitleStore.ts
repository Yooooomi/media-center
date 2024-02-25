import { join } from "path";
import * as fs from "fs";
import { EnvironmentHelper } from "@media-center/domains/src/environment/applicative/environmentHelper";
import { HierarchyItemId } from "@media-center/domains/src/fileWatcher/domain/hierarchyItemId";
import { SubtitleStore } from "@media-center/domains/src/hierarchyEntryInformation/applicative/subtitle.store";

export class FilesystemSubtitleStore implements SubtitleStore {
  private path: string;

  constructor(environmentHelper: EnvironmentHelper) {
    const storeDir = environmentHelper.get("FILESYSTEM_STORE_DIR");
    this.path = join(storeDir, "subtitles");
    if (!fs.existsSync(this.path)) {
      fs.mkdirSync(this.path);
    }
  }

  private getPathFromIdAndIndex(
    hierarchyItemId: HierarchyItemId,
    trackIndex: number,
  ) {
    const path = join(
      this.path,
      `${hierarchyItemId.toString()}-${trackIndex}.vtt`,
    );
    return path;
  }

  async load(hierarchyItemId: HierarchyItemId, trackIndex: number) {
    const path = this.getPathFromIdAndIndex(hierarchyItemId, trackIndex);
    if (!fs.existsSync(path)) {
      return undefined;
    }
    return fs.readFileSync(path).toString();
  }

  async fromLocalFile(
    hierarchyItemId: HierarchyItemId,
    trackIndex: number,
    filepath: string,
  ) {
    const path = this.getPathFromIdAndIndex(hierarchyItemId, trackIndex);
    fs.renameSync(filepath, path);
  }

  async delete(hierarchyItemId: HierarchyItemId, trackIndex: number) {
    const path = this.getPathFromIdAndIndex(hierarchyItemId, trackIndex);
    if (!fs.existsSync(path)) {
      return;
    }
    fs.rmSync(path);
  }

  async deleteAll() {
    for (const file of fs.readdirSync(this.path)) {
      const filepath = join(this.path, file);
      fs.rmSync(filepath);
    }
  }
}
