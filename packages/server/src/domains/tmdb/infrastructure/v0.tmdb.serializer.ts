import { InfrastructureError } from "../../../framework/error";
import { S, Serializer } from "../../../framework/serializer";
import { AnyTmdb } from "../domain/anyTmdb";
import { Movie } from "../domain/movie";
import { Show } from "../domain/show";
import { TmdbId } from "../domain/tmdbId";

class UnknownSerialized extends InfrastructureError {
  constructor(type: string) {
    super(`Type ${type} is unknown`);
  }
}

export class V0TmdbSerializer extends Serializer<AnyTmdb, TmdbId> {
  public version = 0;

  public getIdFromModel(model: AnyTmdb) {
    return model.id;
  }

  async serialize(model: AnyTmdb) {
    if (model instanceof Movie) {
      return {
        id: model.id.toString(),
        type: "movie",
        adult: model.adult,
        backdrop_path: model.backdrop_path,
        original_language: model.original_language,
        original_title: model.original_title,
        overview: model.overview,
        popularity: model.popularity,
        poster_path: model.poster_path,
        release_date: model.release_date,
        title: model.title,
        video: model.video,
        vote_average: model.vote_average,
        vote_count: model.vote_count,
      } as const;
    } else if (model instanceof Show) {
      return {
        id: model.id.toString(),
        type: "show",
        backdrop_path: model.backdrop_path,
        original_language: model.original_language,
        original_title: model.original_title,
        overview: model.overview,
        popularity: model.popularity,
        poster_path: model.poster_path,
        first_air_date: model.first_air_date,
        title: model.title,
        vote_average: model.vote_average,
        vote_count: model.vote_count,
        season_count: model.season_count,
      } as const;
    }
  }

  async deserialize(
    serialized: S<Awaited<ReturnType<this["serialize"]>>>
  ): Promise<AnyTmdb> {
    if (serialized.type === "movie") {
      return new Movie(
        new TmdbId(serialized.id),
        serialized.adult,
        serialized.backdrop_path,
        serialized.original_language,
        serialized.original_title,
        serialized.overview,
        serialized.popularity,
        serialized.poster_path,
        serialized.release_date,
        serialized.title,
        serialized.video,
        serialized.vote_average,
        serialized.vote_count
      );
    } else if (serialized.type === "show") {
      return new Show(
        new TmdbId(serialized.id),
        serialized.backdrop_path,
        serialized.original_language,
        serialized.original_title,
        serialized.overview,
        serialized.popularity,
        serialized.poster_path,
        serialized.first_air_date,
        serialized.title,
        serialized.vote_average,
        serialized.vote_count,
        0
      );
    }
    throw new UnknownSerialized((serialized as any).type);
  }
}
