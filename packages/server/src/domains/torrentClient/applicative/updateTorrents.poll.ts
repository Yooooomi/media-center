import { Polling, CommandBus } from "@media-center/domain-driven";
import { UpdateTorrentRequestCommand } from "../../torrentRequest/applicative/updateTorrentRequest.command";
import { TorrentRequestId } from "../../torrentRequest/domain/torrentRequestId";
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
      torrents.map((torrent) => {
        const a = new UpdateTorrentRequestCommand({
          torrentRequestId: new TorrentRequestId(torrent.hash),
          downloaded: torrent.downloaded,
          speed: torrent.speed,
        });
        this.commandBus.execute(a);
      })
    );
  }
}
