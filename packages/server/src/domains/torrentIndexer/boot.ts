import { QueryBus } from "@media-center/domain-driven";
import { SafeRequest } from "../../framework/safeRequest/safeRequest";
import { EnvironmentHelper } from "../environment/applicative/environmentHelper";
import { SearchTorrentsQueryHandler } from "./applicative/searchTorrents.query";
import { MockTorrentIndexer } from "./infrastructure/mock.torrentIndexer";
import { YggTorrentIndexer } from "./infrastructure/ygg.torrentIndexer";

export function bootTorrentIndexer(
  queryBus: QueryBus,
  environmentHelper: EnvironmentHelper,
  safeRequest: SafeRequest
) {
  const torrentIndexer = environmentHelper.match("DI_TORRENT_INDEXER", {
    mock: () => new MockTorrentIndexer(),
    yggTorrent: () => new YggTorrentIndexer(environmentHelper, safeRequest),
  });

  queryBus.register(new SearchTorrentsQueryHandler(torrentIndexer));

  return { torrentIndexer };
}
