import { Shape } from "../../../framework/shape";

export class ShowSeason extends Shape({
  air_date: String,
  episode_count: Number,
  name: String,
  overview: String,
  poster_path: String,
  season_number: Number,
  vote_average: Number,
}) {}
