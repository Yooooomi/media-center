import { TmdbId } from "./tmdbId";

export class Show {
  constructor(
    public id: TmdbId,
    public backdrop_path: string | null,
    public original_language: string,
    public original_title: string,
    public overview: string,
    public popularity: number,
    public poster_path: string | null,
    public first_air_date: string,
    public title: string,
    public vote_average: number,
    public vote_count: number,
    public season_count: number
  ) {}
}
