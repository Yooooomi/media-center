import { Query, QueryHandler } from "@media-center/domain-driven";
import { uniqBy } from "@media-center/algorithm";
import { TorrentIndexerResult } from "../domain/torrentIndexerResult";
import { SearchQuery } from "../../miscellaneous/tools/searchQuery";
import { TorrentIndexer } from "./torrentIndexer";

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
      console.log("Searching for", q.value);
      const r = await this.torrentIndexer.search(q.value);
      results.push(...r);
    }

    return uniqBy(
      results.sort((a, b) => b.seeders - a.seeders),
      (torrent) => torrent.id.toString(),
    );
  }
}
