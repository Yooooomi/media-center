import { Command, CommandHandler, EventBus } from "@media-center/domain-driven";
import { TorrentRequestId } from "../domain/torrentRequestId";
import { TorrentRequestUpdated } from "../domain/torrentRequest.events";
import { TorrentRequestStore } from "./torrentRequest.store";

export class UpdateTorrentRequestCommand extends Command({
  torrentRequestId: TorrentRequestId,
  downloaded: Number,
  speed: Number,
}) {}

export class UpdateTorrentRequestCommandHandler extends CommandHandler(
  UpdateTorrentRequestCommand,
) {
  constructor(
    private readonly eventBus: EventBus,
    private readonly torrentRequestStore: TorrentRequestStore,
  ) {
    super();
  }

  async execute(command: UpdateTorrentRequestCommand) {
    let existing = await this.torrentRequestStore.load(
      command.torrentRequestId,
    );

    if (!existing) {
      return;
    }

    const updated =
      existing.downloaded !== command.downloaded ||
      existing.speed !== command.speed;

    existing.setDownloaded(command.downloaded);
    existing.setSpeed(command.speed);

    await this.torrentRequestStore.save(existing);

    if (updated) {
      this.eventBus.publish(
        new TorrentRequestUpdated({
          tmdbId: existing.tmdbId,
          torrentRequestId: existing.id,
        }),
      );
    }
  }
}
