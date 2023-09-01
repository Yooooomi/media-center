import { TmdbId } from "./tmdbId";

export class Movie {
  constructor(
    public id: TmdbId,
    public adult: boolean,
    public backdrop_path: string | null,
    public original_language: string,
    public original_title: string,
    public overview: string,
    public popularity: number,
    public poster_path: string | null,
    public release_date: string,
    public title: string,
    public video: boolean,
    public vote_average: number,
    public vote_count: number
  ) {}
}
