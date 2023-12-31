import { CommandBus } from "@media-center/domain-driven";
import { DeleteCatalogEntryCommandHandler } from "./deleteCatalogEntry.command";
import { TorrentClient } from "../torrentClient/applicative/torrentClient";
import { TorrentRequestStore } from "../torrentRequest/applicative/torrentRequest.store";

export function bootCommands(
  commandBus: CommandBus,
  torrentClient: TorrentClient,
  torrentRequestStore: TorrentRequestStore
) {
  commandBus.register(
    new DeleteCatalogEntryCommandHandler(torrentClient, torrentRequestStore)
  );
}
