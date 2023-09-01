import { TorrentIndexerResultId } from "./torrentIndexerResultId";

export class TorrentIndexerResult {
  constructor(
    public readonly id: TorrentIndexerResultId,
    public readonly name: string,
    public readonly leechers: number,
    public readonly seeders: number,
    public readonly size: number,
    public readonly pageUrl: string
  ) {}

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
