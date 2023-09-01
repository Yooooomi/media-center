import { Shape } from "../../../framework/shape";
import { TmdbId } from "../../tmdb/domain/tmdbId";
import { TorrentRequestId } from "./torrentRequestId";

export class TorrentRequest extends Shape({
  id: TorrentRequestId,
  tmdbId: TmdbId,
  name: String,
  size: Number,
  downloaded: Number,
}) {
  public setDownloaded(downloaded: number) {
    this.data.downloaded = downloaded;
  }
}

TorrentRequest.register();
