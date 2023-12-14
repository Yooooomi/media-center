import { Shape } from "@media-center/domain-driven";

export class TorrentClientEntry extends Shape({
  hash: String,
  downloaded: Number,
  speed: Number,
}) {}
