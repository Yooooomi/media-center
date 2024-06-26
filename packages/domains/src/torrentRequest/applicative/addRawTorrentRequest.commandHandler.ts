import { CommandHandler } from "@media-center/domain-driven";
import { TorrentClient } from "../../torrentClient/applicative/torrentClient";
import { TorrentIndexer } from "../../torrentIndexer/applicative/torrentIndexer";
import { AddRawTorrentRequestCommand } from "./addRawTorrentRequest.command";

export class AddRawTorrentRequestCommandHandler extends CommandHandler(
  AddRawTorrentRequestCommand,
) {
  constructor(
    private readonly torrentIndexer: TorrentIndexer,
    private readonly torrentClient: TorrentClient,
  ) {
    super();
  }

  public async execute(command: AddRawTorrentRequestCommand) {
    await this.torrentIndexer.ensureAccessToDownload();
    const torrentBuffer = await this.torrentIndexer.download(command.torrentId);
    await this.torrentClient.download(torrentBuffer, command.isShow);
  }
}
