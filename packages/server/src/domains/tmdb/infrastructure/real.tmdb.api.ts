import { TmdbAPI } from "../applicative/tmdb.api";
import Axios from "axios";
import { TmdbId, TmdbIdType } from "../domain/tmdbId";
import { AnyTmdb } from "../domain/anyTmdb";
import { Movie } from "../domain/movie";
import { Show } from "../domain/show";
import {
  DiscoverMovie,
  DiscoverShow,
  GetMovie,
  GetShow,
  SearchMulti,
  extractYear,
} from "./tmdb.api.utils";
import { compact } from "../../../tools/algorithm";
import { PromiseQueue } from "../../../tools/queue";

const axios = Axios.create({
  baseURL: "https://api.themoviedb.org/3",
  headers: {
    accept: "application/json",
    Authorization:
      "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0YTZiMDIxZTE5Y2YxOTljMTM1NGFhMGRiMDZiOTkzMiIsInN1YiI6IjY0ODYzYWRmMDI4ZjE0MDExZTU1MDkwMiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.yyMkZlhGOGBHtw1yvpBVUUHhu7IKVYho49MvNNKt_wY",
  },
});

const globalQueue = new PromiseQueue(150);

export class RealTmdbAPI extends TmdbAPI {
  async search(
    query: string,
    options?: {
      media?: TmdbIdType;
      year?: number;
    }
  ) {
    const { data } = await globalQueue.queue(() =>
      axios.get<SearchMulti>(
        `https://api.themoviedb.org/3/search/multi?query=${query}&include_adult=false&language=fr-FR&page=1`
      )
    );

    return compact(
      data.results
        .filter(
          (e) =>
            ((options?.media && e.media_type === options.media) ||
              e.media_type === "tv" ||
              e.media_type === "movie") &&
            (!options?.year ||
              (e.media_type === "movie" &&
                extractYear(e.release_date) === options.year) ||
              (e.media_type === "tv" &&
                extractYear(e.first_air_date) === options.year))
        )
        .map((e) => {
          if (e.media_type === "tv") {
            return new Show({
              id: TmdbId.fromIdAndType(e.id.toString(), "show"),
              backdrop_path: e.backdrop_path,
              original_language: e.original_language,
              original_title: e.original_name,
              overview: e.overview,
              popularity: e.popularity,
              poster_path: e.poster_path,
              first_air_date: e.first_air_date,
              title: e.name,
              vote_average: e.vote_average,
              vote_count: e.vote_count,
              season_count: 0,
            });
          } else if (e.media_type === "movie") {
            return new Movie({
              id: TmdbId.fromIdAndType(e.id.toString(), "movie"),
              adult: e.adult,
              backdrop_path: e.backdrop_path,
              original_language: e.original_language,
              original_title: e.original_title,
              overview: e.overview,
              popularity: e.popularity,
              poster_path: e.poster_path,
              release_date: e.release_date,
              title: e.title,
              video: e.video,
              vote_average: e.vote_average,
              vote_count: e.vote_count,
            });
          }
        })
    );
  }

  async get(tmdbId: TmdbId): Promise<AnyTmdb | undefined> {
    if (tmdbId.getType() === "movie") {
      const { data } = await globalQueue.queue(() =>
        axios.get<GetMovie>(
          `https://api.themoviedb.org/3/movie/${tmdbId.toRealId()}?language=en-US`
        )
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
        axios.get<GetShow>(
          `https://api.themoviedb.org/3/tv/${tmdbId.toRealId()}?language=en-US`
        )
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
        season_count: 0,
      });
    }
  }

  async discoverShow(): Promise<Show[]> {
    const { data } = await globalQueue.queue(() =>
      axios.get<DiscoverShow>(
        "/discover/tv?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc"
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
      axios.get<DiscoverMovie>(
        "/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc"
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
}
