import { Command, Dict } from "@media-center/domain-driven";
import { TmdbId } from "../../tmdb/domain/tmdbId";
import { TorrentIndexerResultId } from "../../torrentIndexer/domain/torrentIndexerResultId";

export class AddTorrentRequestCommand extends Command({
  tmdbId: TmdbId,
  torrentId: TorrentIndexerResultId,
}) {}
