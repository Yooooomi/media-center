import { Id } from "../../../framework/id";

export class TorrentIndexerResultId extends Id {
  // Useful so that all Ids do not compile into each other
  get kind() {
    return 0;
  }
}
