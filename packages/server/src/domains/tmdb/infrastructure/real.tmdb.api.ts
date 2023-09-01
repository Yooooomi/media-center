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

const axios = Axios.create({
  baseURL: "https://api.themoviedb.org/3",
  headers: {
    accept: "application/json",
    Authorization:
      "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0YTZiMDIxZTE5Y2YxOTljMTM1NGFhMGRiMDZiOTkzMiIsInN1YiI6IjY0ODYzYWRmMDI4ZjE0MDExZTU1MDkwMiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.yyMkZlhGOGBHtw1yvpBVUUHhu7IKVYho49MvNNKt_wY",
  },
});

export class RealTmdbAPI extends TmdbAPI {
  async search(
    query: string,
    options?: {
      media?: TmdbIdType;
      year?: number;
    }
  ) {
    const { data } = await axios.get<SearchMulti>(
      `https://api.themoviedb.org/3/search/multi?query=${query}&include_adult=false&language=en-US&page=1`
    );

    return compact(
      data.results
        .map((e) => {
          console.log(
            "OPTIONS",
            options?.year,
            e.media_type === "movie" && extractYear(e.release_date),
            e.media_type === "tv" && extractYear(e.first_air_date)
          );
          return e;
        })
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
            return new Show(
              TmdbId.fromIdAndType(e.id.toString(), "show"),
              e.backdrop_path,
              e.original_language,
              e.original_name,
              e.overview,
              e.popularity,
              e.poster_path,
              e.first_air_date,
              e.name,
              e.vote_average,
              e.vote_count,
              1
            );
          } else if (e.media_type === "movie") {
            return new Movie(
              TmdbId.fromIdAndType(e.id.toString(), "movie"),
              e.adult,
              e.backdrop_path,
              e.original_language,
              e.original_title,
              e.overview,
              e.popularity,
              e.poster_path,
              e.release_date,
              e.title,
              e.video,
              e.vote_average,
              e.vote_count
            );
          }
        })
    );
  }

  async get(tmdbId: TmdbId): Promise<AnyTmdb | undefined> {
    if (tmdbId.getType() === "movie") {
      const { data } = await axios.get<GetMovie>(
        `https://api.themoviedb.org/3/movie/${tmdbId.toRealId()}?language=en-US`
      );
      return new Movie(
        TmdbId.fromIdAndType(data.id.toString(), "movie"),
        data.adult,
        data.backdrop_path,
        data.original_language,
        data.original_title,
        data.overview,
        data.popularity,
        data.poster_path,
        data.release_date,
        data.title,
        data.video,
        data.vote_average,
        data.vote_count
      );
    } else {
      const { data } = await axios.get<GetShow>(
        `https://api.themoviedb.org/3/tv/${tmdbId.toRealId()}?language=en-US`
      );
      return new Show(
        TmdbId.fromIdAndType(data.id.toString(), "show"),
        data.backdrop_path,
        data.original_language,
        data.original_name,
        data.overview,
        data.popularity,
        data.poster_path,
        data.first_air_date,
        data.name,
        data.vote_average,
        data.vote_count,
        1
      );
    }
  }

  async discoverShow(): Promise<Show[]> {
    const { data } = await axios.get<DiscoverShow>(
      "/discover/tv?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc"
    );
    return data.results.map(
      (d) =>
        new Show(
          TmdbId.fromIdAndType(d.id.toString(), "show"),
          d.backdrop_path ?? null,
          d.original_language,
          d.original_name,
          d.overview,
          d.popularity,
          d.poster_path ?? null,
          d.first_air_date,
          d.name,
          d.vote_average,
          d.vote_count,
          1
        )
    );
  }

  async discoverMovie() {
    const { data } = await axios.get<DiscoverMovie>(
      "/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc"
    );
    return data.results.map(
      (d) =>
        new Movie(
          TmdbId.fromIdAndType(d.id.toString(), "movie"),
          d.adult,
          d.backdrop_path,
          d.original_language,
          d.original_title,
          d.overview,
          d.popularity,
          d.poster_path,
          d.release_date,
          d.title,
          d.video,
          d.vote_average,
          d.vote_count
        )
    );
  }
}
