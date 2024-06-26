import { Shape, Optional } from "@media-center/domain-driven";
import { TmdbId } from "./tmdbId";

export class Show extends Shape({
  id: TmdbId,
  backdrop_path: Optional(String),
  original_language: String,
  original_title: String,
  overview: String,
  popularity: Number,
  poster_path: Optional(String),
  first_air_date: Date,
  title: String,
  vote_average: Number,
  vote_count: Number,
  season_count: Number,
}) {
  getYear() {
    return this.first_air_date.getFullYear();
  }

  getRoundedNote() {
    return Math.floor(this.vote_average * 10);
  }

  getNoteOutOf(outOf: number) {
    return Math.floor(this.vote_average * 10) / 10 / (10 / outOf);
  }
}
