import { Query, QueryHandler } from "@media-center/domain-driven";
import { TorrentClient } from "../domains/torrentClient/applicative/torrentClient";
import { TorrentIndexer } from "../domains/torrentIndexer/applicative/torrentIndexer";
import { noop } from "@media-center/algorithm";

export class StatusQuery extends Query(undefined, {
  torrentClientStatus: Boolean,
  torrentIndexerStatus: Boolean,
}) {}

export class StatusQueryHandler extends QueryHandler(StatusQuery) {
  constructor(
    private readonly torrentClient: TorrentClient,
    private readonly torrentIndexer: TorrentIndexer
  ) {
    super();
  }

  async execute() {
    let torrentClientStatus = false;
    let torrentIndexerStatus = false;
    await this.torrentClient
      .getState()
      .then(() => {
        torrentClientStatus = true;
      })
      .catch(noop);
    await this.torrentIndexer
      .search("")
      .then(() => {
        torrentIndexerStatus = true;
      })
      .catch(noop);
    return { torrentClientStatus, torrentIndexerStatus };
  }
}
