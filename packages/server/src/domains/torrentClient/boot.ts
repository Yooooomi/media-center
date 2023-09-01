import { CommandBus } from "../../framework/commandBus/commandBus";
import { InMemoryPoll } from "../../framework/poll/inMemory.poll";
import { EnvironmentHelper } from "../environment/applicative/environmentHelper";
import { TorrentRequestStore } from "../torrentRequest/applicative/torrentRequest.store";
import {
  UpdateTorrentRequestCommand,
  UpdateTorrentRequestCommandHandler,
} from "../torrentRequest/applicative/updateTorrentRequest.command";
import { UpdateTorrentsPoll } from "./applicative/updateTorrents.poll";
import { DelugeTorrentClient } from "./infrastucture/deluge.torrentClient";
import { MockTorrentClient } from "./infrastucture/mock.torrentClient";

export function bootTorrentClient(
  commandBus: CommandBus,
  environmentHelper: EnvironmentHelper,
  torrentRequestStore: TorrentRequestStore
) {
  const torrentClient = environmentHelper.match("DI_TORRENT_CLIENT", {
    mock: () => new MockTorrentClient(torrentRequestStore, environmentHelper),
    deluge: () => new DelugeTorrentClient(),
  });

  const unsubscribeUpdateTorrentPoll = new InMemoryPoll(
    new UpdateTorrentsPoll(commandBus, torrentClient)
  ).poll();

  commandBus.register(
    UpdateTorrentRequestCommand,
    new UpdateTorrentRequestCommandHandler(torrentRequestStore)
  );

  return { torrentClient, unsubscribeUpdateTorrentPoll };
}
