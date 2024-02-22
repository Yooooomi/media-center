import { ApplicativeError } from "@media-center/domain-driven";
import ParseTorrent, { Instance } from "parse-torrent";

class InvalidTorrent extends ApplicativeError {
  constructor() {
    super("Provided torrent is invalid");
  }
}

export class TorrentService {
  static getTorrentInfosFromBuffer(buffer: Buffer) {
    const infos = ParseTorrent(buffer) as Instance;

    if (!infos.name || !infos.length || !infos.infoHash || !infos.files) {
      throw new InvalidTorrent();
    }

    return {
      name: infos.name,
      size: infos.length,
      hash: infos.infoHash,
      files: infos.files,
    };
  }
}
