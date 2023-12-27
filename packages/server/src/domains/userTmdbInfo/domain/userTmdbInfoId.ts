import { Constructor, Id } from "@media-center/domain-driven";
import { TmdbId } from "../../tmdb/domain/tmdbId";

export class UserId extends Id {}

export class UserTmdbInfoId extends Id {
  static fromUserAndTmdb<T extends Constructor<Id>>(
    this: T,
    userId: UserId,
    tmdbId: TmdbId
  ) {
    return new this(`${userId.toString()}@${tmdbId.toString()}`);
  }
}
