import { Shape } from "../../../framework/shape";
import { TorrentIndexerResultId } from "./torrentIndexerResultId";

export class TorrentIndexerResult extends Shape({
  id: TorrentIndexerResultId,
  name: String,
  leechers: Number,
  seeders: Number,
  size: Number,
  pageUrl: String,
}) {
  public toDisplaySize() {
    let size = 1024;
    if (this.size < size) {
      return `${this.size} o`;
    }
    if (this.size < size * 1024) {
      return `${this.size / size} ko`;
    }
    size *= 1024;
    if (this.size < size * 1024) {
      return `${this.size / size} mo`;
    }
    size *= 1024;
    if (this.size < size * 1024) {
      return `${this.size / size} go`;
    }
    size *= 1024;
    if (this.size < size * 1024) {
      return `${this.size / size} to`;
    }
    return this.size.toString();
  }
}
