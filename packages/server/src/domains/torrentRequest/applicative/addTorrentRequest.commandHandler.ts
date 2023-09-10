import { CommandHandler } from "../../../framework/command";
import { TorrentService } from "../../../tools/torrentService";
import { TorrentClient } from "../../torrentClient/applicative/torrentClient";
import { TorrentIndexer } from "../../torrentIndexer/applicative/torrentIndexer";
import { TorrentRequest } from "../domain/torrentRequest";
import { TorrentRequestId } from "../domain/torrentRequestId";
import { AddTorrentRequestCommand } from "./addTorrentRequest.command";
import { TorrentRequestStore } from "./torrentRequest.store";

export class AddTorrentRequestCommandHandler extends CommandHandler(
  AddTorrentRequestCommand
) {
  constructor(
    private readonly torrentRequestStore: TorrentRequestStore,
    private readonly torrentClient: TorrentClient,
    private readonly torrentIndexer: TorrentIndexer
  ) {
    super();
  }

  async execute(command: AddTorrentRequestCommand) {
    await this.torrentIndexer.ensureAccessToDownload();
    const torrentBuffer = await this.torrentIndexer.download(
      command.data.torrentId
    );
    const infos = TorrentService.getTorrentInfosFromBuffer(torrentBuffer);
    const request = new TorrentRequest({
      id: new TorrentRequestId(infos.hash),
      tmdbId: command.data.tmdbId,
      name: infos.name,
      size: infos.size,
      downloaded: 0,
    });
    await this.torrentRequestStore.save(request);
    await this.torrentClient.download(torrentBuffer);
  }
}
