import { Command, CommandHandler } from "@media-center/domain-driven";
import { TorrentRequestId } from "../domain/torrentRequestId";
import { TorrentRequestStore } from "./torrentRequest.store";

export class UpdateTorrentRequestCommand extends Command({
  torrentRequestId: TorrentRequestId,
  downloaded: Number,
  speed: Number,
}) {}

export class UpdateTorrentRequestCommandHandler extends CommandHandler(
  UpdateTorrentRequestCommand
) {
  constructor(private readonly torrentRequestStore: TorrentRequestStore) {
    super();
  }

  async execute(command: UpdateTorrentRequestCommand) {
    let existing = await this.torrentRequestStore.load(
      command.torrentRequestId
    );

    if (!existing) {
      console.log(
        "Passing torrent",
        command.torrentRequestId.toString(),
        "it was not found in store"
      );
      return;
    }

    existing.setDownloaded(command.downloaded);
    existing.setSpeed(command.speed);
    await this.torrentRequestStore.save(existing);
  }
}
