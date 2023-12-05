import { Command } from "../../../framework/command";
import { Shape } from "../../../framework/shape";
import { TorrentIndexerResultId } from "../../torrentIndexer/domain/torrentIndexerResultId";

export class AddRawTorrentRequestCommand extends Command({
  needing: Shape({
    isShow: Boolean,
    torrentId: TorrentIndexerResultId,
  }),
}) {}
