import { CommandBus } from "@media-center/domain-driven";
import { DeleteCatalogEntryCommandHandler } from "@media-center/domains/src/commands/deleteCatalogEntry.command";
import { TorrentClient } from "@media-center/domains/src/torrentClient/applicative/torrentClient";
import { TorrentRequestStore } from "@media-center/domains/src/torrentRequest/applicative/torrentRequest.store";

export function bootCommands(
  commandBus: CommandBus,
  torrentClient: TorrentClient,
  torrentRequestStore: TorrentRequestStore,
) {
  commandBus.register(
    new DeleteCatalogEntryCommandHandler(torrentClient, torrentRequestStore),
  );
}
