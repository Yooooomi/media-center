import { Shape, Optional } from "@media-center/domain-driven";
import { extractYear } from "../infrastructure/tmdb.api.utils";
import { TmdbId } from "./tmdbId";

export class Movie extends Shape({
  id: TmdbId,
  adult: Boolean,
  backdrop_path: Optional(String),
  original_language: String,
  original_title: String,
  overview: String,
  popularity: Number,
  poster_path: Optional(String),
  release_date: String,
  title: String,
  video: Boolean,
  vote_average: Number,
  vote_count: Number,
}) {
  getYear() {
    return extractYear(this.release_date);
  }

  getRoundedNote() {
    return Math.floor(this.vote_average * 10);
  }
}
