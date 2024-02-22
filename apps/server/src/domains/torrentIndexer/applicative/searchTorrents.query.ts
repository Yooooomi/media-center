import { Query, QueryHandler } from "@media-center/domain-driven";
import { uniqBy } from "@media-center/algorithm";
import { TorrentIndexer } from "@media-center/domains/src/torrentIndexer/applicative/torrentIndexer";
import { TorrentIndexerResult } from "@media-center/domains/src/torrentIndexer/domain/torrentIndexerResult";
import { SearchQuery } from "@media-center/domains/src/miscellaneous/tools/searchQuery";

export class SearchTorrentsQuery extends Query(
  {
    queries: [SearchQuery],
  },
  [TorrentIndexerResult],
) {}

export class SearchTorrentsQueryHandler extends QueryHandler(
  SearchTorrentsQuery,
) {
  constructor(private readonly torrentIndexer: TorrentIndexer) {
    super();
  }

  async execute(query: SearchTorrentsQuery) {
    const results: TorrentIndexerResult[] = [];
    for (const q of query.queries) {
      const r = await this.torrentIndexer.search(q.value);
      results.push(...r);
    }

    return uniqBy(
      results.sort((a, b) => b.seeders - a.seeders),
      (torrent) => torrent.id.toString(),
    );
  }
}
