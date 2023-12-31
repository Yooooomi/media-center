import { Command, CommandHandler } from "@media-center/domain-driven";
import { TmdbId } from "../tmdb/domain/tmdbId";
import { TorrentRequestStore } from "../torrentRequest/applicative/torrentRequest.store";
import { TorrentClient } from "../torrentClient/applicative/torrentClient";

export class DeleteCatalogEntryCommand extends Command(TmdbId) {}

export class DeleteCatalogEntryCommandHandler extends CommandHandler(
  DeleteCatalogEntryCommand
) {
  constructor(
    private readonly torrentClient: TorrentClient,
    private readonly torrentRequestStore: TorrentRequestStore
  ) {
    super();
  }

  async execute(intent: DeleteCatalogEntryCommand) {
    const requests = await this.torrentRequestStore.loadByTmdbId(intent.value);

    if (requests.length === 0) {
      return;
    }

    await Promise.all(
      requests.map(async (request) => {
        await this.torrentClient.delete(request.id.toString());
      })
    );
  }
}
