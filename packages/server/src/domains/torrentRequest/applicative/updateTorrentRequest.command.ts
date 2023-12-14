import { Command, CommandHandler } from "@media-center/domain-driven";
import { TorrentRequestId } from "../domain/torrentRequestId";
import { TorrentRequestStore } from "./torrentRequest.store";

export class UpdateTorrentRequestCommand extends Command({
  needing: {
    torrentRequestId: TorrentRequestId,
    downloaded: Number,
    speed: Number,
  },
}) {}

export class UpdateTorrentRequestCommandHandler extends CommandHandler(
  UpdateTorrentRequestCommand
) {
  constructor(private readonly torrentRequestStore: TorrentRequestStore) {
    super();
  }

  async execute(command: UpdateTorrentRequestCommand) {
    let existing = await this.torrentRequestStore.load(
      command.data.torrentRequestId
    );

    if (!existing) {
      console.log(
        "Passing torrent",
        command.data.torrentRequestId.toString(),
        "it was not found in store"
      );
      return;
    }

    existing.setDownloaded(command.data.downloaded);
    existing.setSpeed(command.data.speed);
    await this.torrentRequestStore.save(existing);
  }
}
