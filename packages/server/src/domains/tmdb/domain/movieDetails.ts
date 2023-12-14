import { Shape, Multiple } from "@media-center/domain-driven";
import { TmdbId } from "./tmdbId";

export class MovieDetails extends Shape({
  id: TmdbId,
  budget: Number,
  genres: Multiple(String),
  runtime: Number,
}) {
  getStringRuntime() {
    const hours = Math.floor(this.runtime / 60);
    const minutes = this.runtime - hours * 60;
    return `${hours}h${minutes}m`;
  }
}
