import { Event } from "@media-center/domain-driven";
import { TmdbId } from "../../tmdb/domain/tmdbId";
import { TorrentRequestId } from "./torrentRequestId";

export class TorrentRequestAdded extends Event({
  tmdbId: TmdbId,
  torrentRequestId: TorrentRequestId,
}) {}

export class TorrentRequestUpdated extends Event({
  tmdbId: TmdbId,
  torrentRequestId: TorrentRequestId,
}) {}
