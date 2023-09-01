import { Command } from "../../../framework/command";
import { CommandHandler } from "../../../framework/commandHandler";
import { TorrentRequestId } from "../domain/torrentRequestId";
import { TorrentRequestStore } from "./torrentRequest.store";

export class UpdateTorrentRequestCommand extends Command {
  constructor(
    public readonly torrentRequestId: TorrentRequestId,
    public readonly downloaded: number
  ) {
    super();
  }
}

export class UpdateTorrentRequestCommandHandler extends CommandHandler<UpdateTorrentRequestCommand> {
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
    await this.torrentRequestStore.save(existing);
  }
}
