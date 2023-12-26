import { Command, Shape } from "@media-center/domain-driven";
import { TorrentIndexerResultId } from "../../torrentIndexer/domain/torrentIndexerResultId";

export class AddRawTorrentRequestCommand extends Command({
  isShow: Boolean,
  torrentId: TorrentIndexerResultId,
}) {}
