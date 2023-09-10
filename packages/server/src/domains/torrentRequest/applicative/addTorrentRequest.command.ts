import { Command } from "../../../framework/command";
import { Shape } from "../../../framework/shape";
import { TmdbId } from "../../tmdb/domain/tmdbId";
import { TorrentIndexerResultId } from "../../torrentIndexer/domain/torrentIndexerResultId";

export class AddTorrentRequestCommand extends Command({
  needing: Shape({
    tmdbId: TmdbId,
    torrentId: TorrentIndexerResultId,
  }),
}) {}
