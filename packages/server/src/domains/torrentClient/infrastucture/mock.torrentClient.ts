import { useLog } from "../../../framework/useLog";
import { compact } from "@media-center/algorithm";
import { TorrentService } from "../../../tools/torrentService";
import { EnvironmentHelper } from "../../environment/applicative/environmentHelper";
import { TorrentRequestStore } from "../../torrentRequest/applicative/torrentRequest.store";
import { TorrentRequestId } from "../../torrentRequest/domain/torrentRequestId";
import { TorrentClient } from "../applicative/torrentClient";
import * as fs from "fs";
import * as path from "path";
import { TorrentRequest } from "../../torrentRequest/domain/torrentRequest";
import { TorrentClientEntry } from "../domain/torrentClientEntry";

export class MockTorrentClient extends TorrentClient {
  private store: Map<
    string,
    { createdFile: boolean; progress: number; buffer: Buffer; isShow: boolean }
  > = new Map();

  constructor(private readonly environmentHelper: EnvironmentHelper) {
    super();
  }

  private checkDownloaded() {
    const movieDir = this.environmentHelper.get("FILE_WATCHER_MOVIE_DIR");
    const showDir = this.environmentHelper.get("FILE_WATCHER_SHOW_DIR");
    for (const value of this.store.values()) {
      if (value.progress < 1 || value.createdFile) {
        continue;
      }
      value.progress = 0.9;
      return;
      const infos = TorrentService.getTorrentInfosFromBuffer(value.buffer);
      for (const file of infos.files) {
        const filename = path.join(
          value.isShow ? showDir : movieDir,
          file.name
        );
        fs.writeFileSync(filename, "fake downloaded file");
      }
      value.createdFile = true;
    }
  }

  async getState() {
    for (const value of this.store.values()) {
      value.progress += 0.5;
    }

    this.checkDownloaded();

    return compact(
      await Promise.all(
        [...this.store.values()].map(async (v) => {
          const infos = TorrentService.getTorrentInfosFromBuffer(v.buffer);
          return new TorrentClientEntry({
            hash: infos.hash,
            downloaded: v.progress,
            speed: 10298,
          });
        })
      )
    );
  }

  async download(buffer: Buffer, isShow: boolean) {
    const infos = TorrentService.getTorrentInfosFromBuffer(buffer);
    this.store.set(infos.hash, {
      buffer,
      progress: 0,
      createdFile: false,
      isShow,
    });
  }
}
