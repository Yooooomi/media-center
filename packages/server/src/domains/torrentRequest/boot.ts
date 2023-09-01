import { CommandBus } from "../../framework/commandBus/commandBus";
import { QueryBus } from "../../framework/queryBus/queryBus";
import { TorrentClient } from "../torrentClient/applicative/torrentClient";
import { TorrentIndexer } from "../torrentIndexer/applicative/torrentIndexer";
import { AddTorrentRequestCommand } from "./applicative/addTorrentRequest.command";
import { AddTorrentRequestCommandHandler } from "./applicative/addTorrentRequest.commandHandler";
import {
  GetTorrentRequestsQuery,
  GetTorrentRequestsQueryHandler,
} from "./applicative/getTorrentRequests.query";
import { TorrentRequestStore } from "./applicative/torrentRequest.store";

export function bootTorrentRequest(
  commandBus: CommandBus,
  queryBus: QueryBus,
  torrentClient: TorrentClient,
  torrentIndexer: TorrentIndexer,
  torrentRequestStore: TorrentRequestStore
) {
  commandBus.register(
    AddTorrentRequestCommand,
    new AddTorrentRequestCommandHandler(
      torrentRequestStore,
      torrentClient,
      torrentIndexer
    )
  );

  queryBus.register(
    GetTorrentRequestsQuery,
    new GetTorrentRequestsQueryHandler(torrentRequestStore)
  );
}
