import { TorrentClient } from "../torrentClient/applicative/torrentClient";
import { TorrentIndexer } from "../torrentIndexer/applicative/torrentIndexer";
import { AddRawTorrentRequestCommandHandler } from "./applicative/addRawTorrentRequest.commandHandler";
import { AddRawTorrentRequestCommand } from "./applicative/addRawTorrentRequest.command";
import { AddTorrentRequestCommand } from "./applicative/addTorrentRequest.command";
import { AddTorrentRequestCommandHandler } from "./applicative/addTorrentRequest.commandHandler";
import {
  GetTorrentRequestsQuery,
  GetTorrentRequestsQueryHandler,
} from "./applicative/getTorrentRequests.query";
import { TorrentRequestStore } from "./applicative/torrentRequest.store";
import {
  GetAllTorrentRequestsQuery,
  GetAllTorrentRequestsQueryHandler,
} from "./applicative/getAllTorrentRequests.query";
import { CommandBus, QueryBus } from "@media-center/domain-driven";

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
  commandBus.register(
    AddRawTorrentRequestCommand,
    new AddRawTorrentRequestCommandHandler(torrentIndexer, torrentClient)
  );

  queryBus.register(
    GetTorrentRequestsQuery,
    new GetTorrentRequestsQueryHandler(torrentRequestStore)
  );
  queryBus.register(
    GetAllTorrentRequestsQuery,
    new GetAllTorrentRequestsQueryHandler(torrentRequestStore)
  );
}
