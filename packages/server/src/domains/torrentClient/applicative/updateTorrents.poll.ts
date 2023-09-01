import { CommandBus } from "../../../framework/commandBus/commandBus";
import { Polling } from "../../../framework/poll/poll";
import { UpdateTorrentRequestCommand } from "../../torrentRequest/applicative/updateTorrentRequest.command";
import { TorrentClient } from "./torrentClient";

export class UpdateTorrentsPoll extends Polling {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly torrentClient: TorrentClient
  ) {
    super();
  }

  public intervalMs = 5000;

  async execute() {
    const torrents = await this.torrentClient.getState();

    await Promise.all(
      torrents.map((torrent) =>
        this.commandBus.execute(
          new UpdateTorrentRequestCommand(
            torrent.data.id,
            torrent.data.downloaded
          )
        )
      )
    );
  }
}
