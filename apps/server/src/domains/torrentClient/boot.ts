import {
  CommandBus,
  EventBus,
  InMemoryPoll,
} from "@media-center/domain-driven";
import { EnvironmentHelper } from "@media-center/domains/src/environment/applicative/environmentHelper";
import { UpdateTorrentsPoll } from "@media-center/domains/src/torrentClient/applicative/updateTorrents.poll";
import { TorrentRequestStore } from "@media-center/domains/src/torrentRequest/applicative/torrentRequest.store";
import { UpdateTorrentRequestCommandHandler } from "@media-center/domains/src/torrentRequest/applicative/updateTorrentRequest.command";
import { MockTorrentClient } from "./infrastucture/mock.torrentClient";
import { DelugeTorrentClient } from "./infrastucture/deluge.torrentClient";

export function bootTorrentClient(
  commandBus: CommandBus,
  eventBus: EventBus,
  environmentHelper: EnvironmentHelper,
  torrentRequestStore: TorrentRequestStore,
) {
  const torrentClient = environmentHelper.match("DI_TORRENT_CLIENT", {
    mock: () => new MockTorrentClient(environmentHelper),
    deluge: () => new DelugeTorrentClient(environmentHelper),
  });

  const unsubscribeUpdateTorrentPoll = new InMemoryPoll(
    new UpdateTorrentsPoll(commandBus, torrentClient),
  ).poll();

  commandBus.register(
    new UpdateTorrentRequestCommandHandler(eventBus, torrentRequestStore),
  );

  return { torrentClient, unsubscribeUpdateTorrentPoll };
}
