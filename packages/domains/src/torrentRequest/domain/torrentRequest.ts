import { Freeze, Shape } from "@media-center/domain-driven";
import { TmdbId } from "../../tmdb/domain/tmdbId";
import { TorrentRequestId } from "./torrentRequestId";

@Freeze()
export class TorrentRequest extends Shape({
  id: TorrentRequestId,
  tmdbId: TmdbId,
  name: String,
  size: Number,
  speed: Number,
  downloaded: Number,
}) {
  public get ended() {
    return this.getClampedDownloaded() === 1;
  }

  public setDownloaded(downloaded: number) {
    this.downloaded = downloaded;
  }

  public setSpeed(speed: number) {
    this.speed = speed;
  }

  public getClampedDownloaded() {
    return this.downloaded > 1 ? 1 : this.downloaded;
  }

  public getPercentage() {
    return Math.floor(this.getClampedDownloaded() * 10000) / 100;
  }

  public getDisplaySize(size: number) {
    const byte = 1;
    const kb = byte * 1024;
    const mb = kb * kb;
    const gb = mb * kb;

    if (size > gb) {
      return `${Math.floor((size / gb) * 100) / 100}Go`;
    } else if (size > mb) {
      return `${Math.floor((size / mb) * 100) / 100}Mo`;
    } else if (size > kb) {
      return `${Math.floor((size / kb) * 100) / 100}Ko`;
    }
    return `${Math.floor(size * 100) / 100}o`;
  }

  public getSpeed() {
    return `${this.getDisplaySize(this.speed)}/s`;
  }

  public getSizeProgress() {
    return `${this.getDisplaySize(
      this.getClampedDownloaded() * this.size,
    )}/${this.getDisplaySize(this.size)}`;
  }
}
