import { TorrentClient } from "../torrentClient/applicative/torrentClient";
import { TorrentIndexer } from "../torrentIndexer/applicative/torrentIndexer";
import { AddRawTorrentRequestCommandHandler } from "./applicative/addRawTorrentRequest.commandHandler";
import { AddTorrentRequestCommandHandler } from "./applicative/addTorrentRequest.commandHandler";
import { GetTorrentRequestsQueryHandler } from "./applicative/getTorrentRequests.query";
import { TorrentRequestStore } from "./applicative/torrentRequest.store";
import { GetAllTorrentRequestsQueryHandler } from "./applicative/getAllTorrentRequests.query";
import { CommandBus, QueryBus } from "@media-center/domain-driven";

export function bootTorrentRequest(
  commandBus: CommandBus,
  queryBus: QueryBus,
  torrentClient: TorrentClient,
  torrentIndexer: TorrentIndexer,
  torrentRequestStore: TorrentRequestStore
) {
  commandBus.register(
    new AddTorrentRequestCommandHandler(
      torrentRequestStore,
      torrentClient,
      torrentIndexer
    )
  );
  commandBus.register(
    new AddRawTorrentRequestCommandHandler(torrentIndexer, torrentClient)
  );

  queryBus.register(new GetTorrentRequestsQueryHandler(torrentRequestStore));
  queryBus.register(new GetAllTorrentRequestsQueryHandler(torrentRequestStore));
}
