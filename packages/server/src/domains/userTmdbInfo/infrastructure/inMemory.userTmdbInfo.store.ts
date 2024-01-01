import {
  Either,
  InMemoryDatabase,
  InMemoryStore,
  SerializableSerializer,
} from "@media-center/domain-driven";
import { UserTmdbInfoStore } from "../applicative/userTmdbInfo.store";
import {
  AnyUserTmdbInfo,
  UserTmdbMovieInfo,
  UserTmdbShowInfo,
} from "../domain/userTmdbInfo";
import { UserId } from "../domain/userTmdbInfoId";

export class InMemoryUserTmdbInfoStore
  extends InMemoryStore<AnyUserTmdbInfo>
  implements UserTmdbInfoStore
{
  constructor(database: InMemoryDatabase) {
    super(
      database,
      "userTmdbInfo",
      new SerializableSerializer(Either(UserTmdbMovieInfo, UserTmdbShowInfo))
    );
  }

  loadByUserId(userId: UserId) {
    return this.filter((e) => e.id.equalsUserId(userId));
  }
}
