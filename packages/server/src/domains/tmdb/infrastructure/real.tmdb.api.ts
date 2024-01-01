import { TmdbAPI } from "../applicative/tmdb.api";
import Axios, { AxiosInstance } from "axios";
import { TmdbId } from "../domain/tmdbId";
import { AnyTmdb } from "../domain/anyTmdb";
import { Movie } from "../domain/movie";
import { Show } from "../domain/show";
import {
  DiscoverMovie,
  DiscoverShow,
  Episode,
  GetMovie,
  GetShow,
  MovieDetailsQuery,
  SearchMovie,
  SearchShow,
  Season,
} from "./tmdb.api.utils";
import { PromiseQueue } from "../../../tools/queue";
import { ShowSeason } from "../domain/showSeason";
import { ShowEpisode } from "../domain/showEpisode";
import { MovieDetails } from "../domain/movieDetails";
import { EnvironmentHelper } from "../../environment/applicative/environmentHelper";

const globalQueue = new PromiseQueue(150);

export class RealTmdbAPI extends TmdbAPI {
  axios: AxiosInstance;

  constructor(environmentHelper: EnvironmentHelper) {
    super();
    this.axios = Axios.create({
      baseURL: "https://api.themoviedb.org/3",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${environmentHelper.get("TMDB_API_KEY")}`,
      },
    });
  }

  async getEpisodes(
    tmdbId: TmdbId,
    seasonNumber: number
  ): Promise<ShowEpisode[]> {
    const { data } = await globalQueue.queue(() =>
      this.axios.get<{ episodes: Episode[] }>(
        `/tv/${tmdbId.toRealId()}/season/${seasonNumber}`
      )
    );
    return data.episodes.map(
      (e) =>
        new ShowEpisode({
          show_id: TmdbId.fromIdAndType(e.show_id.toString(), "show"),
          air_date: e.air_date,
          episode_number: e.episode_number,
          episode_type: e.episode_type,
          name: e.name,
          overview: e.overview,
          production_code: e.production_code,
          runtime: e.runtime,
          season_number: e.season_number,
          still_path: e.still_path,
          vote_average: e.vote_average,
          vote_count: e.vote_count,
        })
    );
  }

  async getSeasons(tmdbId: TmdbId): Promise<ShowSeason[]> {
    const { data } = await globalQueue.queue(() =>
      this.axios.get<{ seasons: Season[] }>(`/tv/${tmdbId.toRealId()}`)
    );
    return data.seasons.map(
      (s) =>
        new ShowSeason({
          air_date: s.air_date,
          episode_count: s.episode_count,
          name: s.name,
          overview: s.overview,
          poster_path: s.poster_path,
          season_number: s.season_number,
          vote_average: s.vote_average,
        })
    );
  }

  async searchMovies(query: string, year?: number): Promise<AnyTmdb[]> {
    const { data } = await globalQueue.queue(() =>
      this.axios.get<SearchMovie>("/search/movie", {
        params: {
          query,
          year,
          include_adult: false,
          language: "fr-FR",
          page: 1,
        },
      })
    );
    return data.results.map(
      (e) =>
        new Movie({
          id: TmdbId.fromIdAndType(e.id.toString(), "movie"),
          adult: e.adult,
          original_language: e.original_language,
          original_title: e.original_title,
          overview: e.overview,
          popularity: e.popularity,
          release_date: e.release_date,
          title: e.title,
          video: e.video,
          vote_average: e.vote_average,
          vote_count: e.vote_count,
          backdrop_path: e.backdrop_path ?? undefined,
          poster_path: e.poster_path ?? undefined,
        })
    );
  }
  async searchShows(query: string, year?: number): Promise<AnyTmdb[]> {
    const { data } = await globalQueue.queue(() =>
      this.axios.get<SearchShow>("/search/tv", {
        params: {
          query,
          year,
          include_adult: false,
          language: "fr-FR",
          page: 1,
        },
      })
    );
    return data.results.map(
      (e) =>
        new Show({
          id: TmdbId.fromIdAndType(e.id.toString(), "show"),
          first_air_date: e.first_air_date,
          original_language: e.original_language,
          original_title: e.original_name,
          overview: e.overview,
          popularity: e.popularity,
          season_count: 0,
          title: e.name,
          vote_average: e.vote_average,
          vote_count: e.vote_count,
          backdrop_path: e.backdrop_path,
          poster_path: e.poster_path ?? undefined,
        })
    );
  }

  async get(tmdbId: TmdbId): Promise<AnyTmdb | undefined> {
    if (tmdbId.getType() === "movie") {
      const { data } = await globalQueue.queue(() =>
        this.axios.get<GetMovie>(`/movie/${tmdbId.toRealId()}?language=fr-FR`)
      );
      return new Movie({
        id: TmdbId.fromIdAndType(data.id.toString(), "movie"),
        adult: data.adult,
        backdrop_path: data.backdrop_path,
        original_language: data.original_language,
        original_title: data.original_title,
        overview: data.overview,
        popularity: data.popularity,
        poster_path: data.poster_path,
        release_date: data.release_date,
        title: data.title,
        video: data.video,
        vote_average: data.vote_average,
        vote_count: data.vote_count,
      });
    } else {
      const { data } = await globalQueue.queue(() =>
        this.axios.get<GetShow>(`/tv/${tmdbId.toRealId()}?language=fr-FR`)
      );
      return new Show({
        id: TmdbId.fromIdAndType(data.id.toString(), "show"),
        backdrop_path: data.backdrop_path,
        original_language: data.original_language,
        original_title: data.original_name,
        overview: data.overview,
        popularity: data.popularity,
        poster_path: data.poster_path,
        first_air_date: data.first_air_date,
        title: data.name,
        vote_average: data.vote_average,
        vote_count: data.vote_count,
        season_count: data.number_of_seasons,
      });
    }
  }

  async discoverShow(): Promise<Show[]> {
    const { data } = await globalQueue.queue(() =>
      this.axios.get<DiscoverShow>(
        "/discover/tv?include_adult=false&include_video=false&language=fr-FR&page=1&sort_by=popularity.desc&with_release_type=4|5|6"
      )
    );
    return data.results.map(
      (d) =>
        new Show({
          id: TmdbId.fromIdAndType(d.id.toString(), "show"),
          backdrop_path: d.backdrop_path,
          original_language: d.original_language,
          original_title: d.original_name,
          overview: d.overview,
          popularity: d.popularity,
          poster_path: d.poster_path,
          first_air_date: d.first_air_date,
          title: d.name,
          vote_average: d.vote_average,
          vote_count: d.vote_count,
          season_count: 0,
        })
    );
  }

  async discoverMovie() {
    const { data } = await globalQueue.queue(() =>
      this.axios.get<DiscoverMovie>(
        "/discover/movie?include_adult=false&include_video=false&language=fr-FR&page=1&sort_by=popularity.desc&with_release_type=4|5|6"
      )
    );
    return data.results.map(
      (d) =>
        new Movie({
          id: TmdbId.fromIdAndType(d.id.toString(), "movie"),
          adult: d.adult,
          backdrop_path: d.backdrop_path,
          original_language: d.original_language,
          original_title: d.original_title,
          overview: d.overview,
          popularity: d.popularity,
          poster_path: d.poster_path,
          release_date: d.release_date,
          title: d.title,
          video: d.video,
          vote_average: d.vote_average,
          vote_count: d.vote_count,
        })
    );
  }

  async getMovieDetails(tmdbId: TmdbId) {
    try {
      const { data } = await globalQueue.queue(() =>
        this.axios.get<MovieDetailsQuery>(
          `/movie/${tmdbId.toRealId()}?language=fr-FR`
        )
      );
      return new MovieDetails({
        id: tmdbId,
        budget: data.budget,
        genres: data.genres.map((g) => g.name),
        runtime: data.runtime,
      });
    } catch (e) {
      return undefined;
    }
  }
}
