import { Event } from "@media-center/domain-driven";
import { TmdbId } from "../../tmdb/domain/tmdbId";

export class TorrentRequestAdded extends Event({
  tmdbId: TmdbId,
}) {}

export class TorrentRequestUpdated extends Event({
  tmdbId: TmdbId,
}) {}
