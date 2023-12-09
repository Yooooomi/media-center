import { Query, QueryHandler } from "../../../framework/query";
import { Multiple } from "../../../framework/shape";
import { TorrentRequest } from "../domain/torrentRequest";
import { TorrentRequestStore } from "./torrentRequest.store";

export class GetAllTorrentRequestsQuery extends Query({
  returning: Multiple(TorrentRequest),
}) {}

export class GetAllTorrentRequestsQueryHandler extends QueryHandler(
  GetAllTorrentRequestsQuery
) {
  constructor(private readonly torrentRequestStore: TorrentRequestStore) {
    super();
  }

  async execute(query: GetAllTorrentRequestsQuery) {
    const torrents = await this.torrentRequestStore.loadAll();

    return torrents;
  }
}