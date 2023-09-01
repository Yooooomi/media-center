import { useLog } from "../../../framework/useLog";
import { compact } from "../../../tools/algorithm";
import { TorrentService } from "../../../tools/torrentService";
import { EnvironmentHelper } from "../../environment/applicative/environmentHelper";
import { TorrentRequestStore } from "../../torrentRequest/applicative/torrentRequest.store";
import { TorrentRequestId } from "../../torrentRequest/domain/torrentRequestId";
import { TorrentClient } from "../applicative/torrentClient";
import * as fs from "fs";
import * as path from "path";

export class MockTorrentClient extends TorrentClient {
  private store: Map<
    string,
    { createdFile: boolean; progress: number; buffer: Buffer }
  > = new Map();

  constructor(
    private readonly torrentRequestStore: TorrentRequestStore,
    private readonly environmentHelper: EnvironmentHelper
  ) {
    super();
  }

  private checkDownloaded() {
    const log = useLog(MockTorrentClient.name);
    log.debug(this.store);
    const dir = this.environmentHelper.get("FILE_WATCHER_MOVIE_DIR");
    for (const value of this.store.values()) {
      if (value.progress < 1 || value.createdFile) {
        continue;
      }
      const infos = TorrentService.getTorrentInfosFromBuffer(value.buffer);
      for (const file of infos.files) {
        const filename = path.join(dir, file.name);
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
          const id = new TorrentRequestId(infos.hash);
          const torrent = await this.torrentRequestStore.load(id);
          if (!torrent) {
            console.log("Unknown torrent found");
            return undefined;
          }
          return torrent;
        })
      )
    );
  }

  async download(buffer: Buffer) {
    const infos = TorrentService.getTorrentInfosFromBuffer(buffer);
    this.store.set(infos.hash, { buffer, progress: 0, createdFile: false });
  }
}
