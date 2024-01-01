import { compact } from "@media-center/algorithm";
import { TorrentService } from "../../../tools/torrentService";
import { EnvironmentHelper } from "../../environment/applicative/environmentHelper";
import { TorrentClient } from "../applicative/torrentClient";
import * as fs from "fs";
import * as path from "path";
import { TorrentClientEntry } from "../domain/torrentClientEntry";

export class MockTorrentClient extends TorrentClient {
  private store: Map<
    string,
    {
      filenames: string[] | undefined;
      progress: number;
      buffer: Buffer;
      isShow: boolean;
    }
  > = new Map();

  constructor(private readonly environmentHelper: EnvironmentHelper) {
    super();
  }

  private getFilepathFromFilename(filename: string, isShow: boolean) {
    const movieDir = this.environmentHelper.get("FILE_WATCHER_MOVIE_DIR");
    const showDir = this.environmentHelper.get("FILE_WATCHER_SHOW_DIR");

    return path.join(isShow ? showDir : movieDir, filename);
  }

  private checkDownloaded() {
    for (const value of this.store.values()) {
      if (value.progress < 1 || value.filenames) {
        continue;
      }
      const infos = TorrentService.getTorrentInfosFromBuffer(value.buffer);
      value.filenames = [];
      for (const file of infos.files) {
        const filename = this.getFilepathFromFilename(file.name, value.isShow);
        fs.writeFileSync(filename, "fake downloaded file");
        value.filenames.push(file.name);
      }
    }
  }

  async getState() {
    for (const value of this.store.values()) {
      value.progress += 0.05;
    }

    this.checkDownloaded();

    return compact(
      await Promise.all(
        [...this.store.values()].map(async (v) => {
          const infos = TorrentService.getTorrentInfosFromBuffer(v.buffer);
          return new TorrentClientEntry({
            hash: infos.hash,
            downloaded: v.progress,
            // Random between 0o/s and 30mo/s
            speed: Math.floor(Math.random() * 1024 * 1024 * 30),
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
      filenames: undefined,
      isShow,
    });
  }

  async delete(hash: string) {
    const torrent = this.store.get(hash);

    if (!torrent) {
      return;
    }

    torrent.filenames?.forEach((filename) => {
      const filepath = this.getFilepathFromFilename(filename, torrent.isShow);
      fs.rmSync(filepath);
    });
  }
}
