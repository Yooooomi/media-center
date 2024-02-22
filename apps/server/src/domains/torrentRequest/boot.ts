import { CommandBus, EventBus, QueryBus } from "@media-center/domain-driven";
import { TorrentClient } from "@media-center/domains/src/torrentClient/applicative/torrentClient";
import { TorrentIndexer } from "@media-center/domains/src/torrentIndexer/applicative/torrentIndexer";
import { AddRawTorrentRequestCommandHandler } from "@media-center/domains/src/torrentRequest/applicative/addRawTorrentRequest.commandHandler";
import { AddTorrentRequestCommandHandler } from "@media-center/domains/src/torrentRequest/applicative/addTorrentRequest.commandHandler";
import { GetAllTorrentRequestsQueryHandler } from "@media-center/domains/src/torrentRequest/applicative/getAllTorrentRequests.query";
import { GetTorrentRequestsQueryHandler } from "@media-center/domains/src/torrentRequest/applicative/getTorrentRequests.query";
import { TorrentRequestStore } from "@media-center/domains/src/torrentRequest/applicative/torrentRequest.store";

export function bootTorrentRequest(
  commandBus: CommandBus,
  queryBus: QueryBus,
  eventBus: EventBus,
  torrentClient: TorrentClient,
  torrentIndexer: TorrentIndexer,
  torrentRequestStore: TorrentRequestStore,
) {
  commandBus.register(
    new AddTorrentRequestCommandHandler(
      eventBus,
      torrentRequestStore,
      torrentClient,
      torrentIndexer,
    ),
  );
  commandBus.register(
    new AddRawTorrentRequestCommandHandler(torrentIndexer, torrentClient),
  );

  queryBus.register(new GetTorrentRequestsQueryHandler(torrentRequestStore));
  queryBus.register(new GetAllTorrentRequestsQueryHandler(torrentRequestStore));
}
