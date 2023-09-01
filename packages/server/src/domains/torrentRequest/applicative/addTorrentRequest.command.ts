import { Command } from "../../../framework/command";
import { TmdbId } from "../../tmdb/domain/tmdbId";
import { TorrentIndexerResultId } from "../../torrentIndexer/domain/torrentIndexerResultId";

export class AddTorrentRequestCommand extends Command {
  constructor(
    public readonly tmdbId: TmdbId,
    public readonly torrentId: TorrentIndexerResultId
  ) {
    super();
  }
}
