import { Shape } from "../../../framework/shape";
import { TmdbId } from "./tmdbId";

export class ShowEpisode extends Shape({
  show_id: TmdbId,
  air_date: String,
  episode_number: Number,
  episode_type: String,
  name: String,
  overview: String,
  production_code: String,
  runtime: Number,
  season_number: Number,
  still_path: String,
  vote_average: Number,
  vote_count: Number,
}) {}
