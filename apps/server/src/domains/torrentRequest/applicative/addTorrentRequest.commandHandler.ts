import { CommandHandler, EventBus } from "@media-center/domain-driven";
import { TorrentService } from "@media-center/domains/src/miscellaneous/tools/torrentService";
import { TorrentClient } from "@media-center/domains/src/torrentClient/applicative/torrentClient";
import { TorrentIndexer } from "@media-center/domains/src/torrentIndexer/applicative/torrentIndexer";
import { AddTorrentRequestCommand } from "@media-center/domains/src/torrentRequest/applicative/addTorrentRequest.command";
import { TorrentRequestStore } from "@media-center/domains/src/torrentRequest/applicative/torrentRequest.store";
import { TorrentRequest } from "@media-center/domains/src/torrentRequest/domain/torrentRequest";
import { TorrentRequestAdded } from "@media-center/domains/src/torrentRequest/domain/torrentRequest.events";
import { TorrentRequestId } from "@media-center/domains/src/torrentRequest/domain/torrentRequestId";

export class AddTorrentRequestCommandHandler extends CommandHandler(
  AddTorrentRequestCommand,
) {
  constructor(
    private readonly eventBus: EventBus,
    private readonly torrentRequestStore: TorrentRequestStore,
    private readonly torrentClient: TorrentClient,
    private readonly torrentIndexer: TorrentIndexer,
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
      command.tmdbId.getType() === "show",
    );
    this.eventBus.publish(
      new TorrentRequestAdded({
        tmdbId: command.tmdbId,
        torrentRequestId: request.id,
      }),
    );
  }
}
