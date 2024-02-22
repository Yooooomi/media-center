import { Constructor, Id } from "@media-center/domain-driven";
import { TmdbId } from "../../tmdb/domain/tmdbId";

export class UserId extends Id {}

export class UserTmdbInfoId {
  constructor(public readonly userId: UserId, public readonly tmdbId: TmdbId) {}

  serialize() {
    return this.toString();
  }

  static deserialize(serialized: string) {
    const [userIdStr, tmdbIdStr] = serialized.split("@");
    if (!userIdStr || !tmdbIdStr) {
      throw new Error("Malformed UserTmdbInfoId");
    }
    return new UserTmdbInfoId(new UserId(userIdStr), new TmdbId(tmdbIdStr));
  }

  toString() {
    return `${this.userId.toString()}@${this.tmdbId.toString()}`;
  }

  equals(other: UserTmdbInfoId) {
    return this.userId.equals(other.userId) && this.tmdbId.equals(other.tmdbId);
  }

  equalsUserId(userId: UserId) {
    return this.userId.equals(userId);
  }

  equalsTmdbId(tmdbId: TmdbId) {
    return this.tmdbId.equals(tmdbId);
  }
}
