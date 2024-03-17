import {
  Database,
  Either,
  SQLiteStore,
  SerializableSerializer,
} from "@media-center/domain-driven";
import { UserTmdbInfoStore } from "@media-center/domains/src/userTmdbInfo/applicative/userTmdbInfo.store";
import {
  AnyUserTmdbInfo,
  UserTmdbMovieInfo,
  UserTmdbShowInfo,
} from "@media-center/domains/src/userTmdbInfo/domain/userTmdbInfo";
import { UserId } from "@media-center/domains/src/userTmdbInfo/domain/userTmdbInfoId";

export class SQLiteUserTmdbInfoStore
  extends SQLiteStore<AnyUserTmdbInfo>
  implements UserTmdbInfoStore
{
  constructor(database: Database) {
    super(
      database,
      "userTmdbInfo",
      new SerializableSerializer(Either(UserTmdbMovieInfo, UserTmdbShowInfo)),
    );
  }

  loadByUserId(userId: UserId) {
    return this._select("WHERE id LIKE ?", undefined, `${userId.toString()}@%`);
  }
}
