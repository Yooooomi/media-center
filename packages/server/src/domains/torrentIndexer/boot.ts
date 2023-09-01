import { QueryBus } from "../../framework/queryBus/queryBus";
import { SafeRequest } from "../../framework/safeRequest/safeRequest";
import { EnvironmentHelper } from "../environment/applicative/environmentHelper";
import { TmdbStore } from "../tmdb/applicative/tmdb.store";
import {
  SearchTorrentsQuery,
  SearchTorrentsQueryHandler,
} from "./applicative/searchTorrents.query";
import { MockTorrentIndexer } from "./infrastructure/mock.torrentIndexer";
import { YggTorrentIndexer } from "./infrastructure/ygg.torrentIndexer";

export function bootTorrentIndexer(
  queryBus: QueryBus,
  tmdbStore: TmdbStore,
  environmentHelper: EnvironmentHelper,
  safeRequest: SafeRequest
) {
  const torrentIndexer = environmentHelper.match("DI_TORRENT_INDEXER", {
    mock: () => new MockTorrentIndexer(),
    yggTorrent: () => new YggTorrentIndexer(safeRequest),
  });

  queryBus.register(
    SearchTorrentsQuery,
    new SearchTorrentsQueryHandler(tmdbStore, torrentIndexer)
  );

  return { torrentIndexer };
}
