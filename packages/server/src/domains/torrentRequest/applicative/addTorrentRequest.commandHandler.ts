import { CommandHandler, EventBus } from "@media-center/domain-driven";
import { TorrentService } from "../../../tools/torrentService";
import { TorrentClient } from "../../torrentClient/applicative/torrentClient";
import { TorrentIndexer } from "../../torrentIndexer/applicative/torrentIndexer";
import { TorrentRequest } from "../domain/torrentRequest";
import { TorrentRequestId } from "../domain/torrentRequestId";
import { AddTorrentRequestCommand } from "./addTorrentRequest.command";
import { TorrentRequestStore } from "./torrentRequest.store";
import { TorrentRequestAdded } from "../domain/torrentRequest.events";

export class AddTorrentRequestCommandHandler extends CommandHandler(
  AddTorrentRequestCommand
) {
  constructor(
    private readonly eventBus: EventBus,
    private readonly torrentRequestStore: TorrentRequestStore,
    private readonly torrentClient: TorrentClient,
    private readonly torrentIndexer: TorrentIndexer
  ) {
    super();
  }

  async execute(command: AddTorrentRequestCommand) {
    await this.torrentIndexer.ensureAccessToDownload();
    const torrentBuffer = await this.torrentIndexer.download(command.torrentId);
    const infos = TorrentService.getTorrentInfosFromBuffer(torrentBuffer);
    const request = new TorrentRequest({
      id: new TorrentRequestId(infos.hash),
      tmdbId: command.tmdbId,
      name: infos.name,
      size: infos.size,
      speed: 0,
      downloaded: 0,
    });
    await this.torrentRequestStore.save(request);
    await this.torrentClient.download(
      torrentBuffer,
      command.tmdbId.getType() === "show"
    );
    this.eventBus.publish(new TorrentRequestAdded({ tmdbId: command.tmdbId }));
  }
}
