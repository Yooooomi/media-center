import { Command, Shape } from "@media-center/domain-driven";
import { TorrentIndexerResultId } from "../../torrentIndexer/domain/torrentIndexerResultId";

export class AddRawTorrentRequestCommand extends Command({
  needing: Shape({
    isShow: Boolean,
    torrentId: TorrentIndexerResultId,
  }),
}) {}
