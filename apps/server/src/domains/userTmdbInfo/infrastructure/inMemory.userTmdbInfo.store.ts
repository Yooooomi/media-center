import {
  Either,
  InMemoryDatabase,
  InMemoryStore,
  SerializableSerializer,
} from "@media-center/domain-driven";
import { UserTmdbInfoStore } from "@media-center/domains/src/userTmdbInfo/applicative/userTmdbInfo.store";
import {
  AnyUserTmdbInfo,
  UserTmdbMovieInfo,
  UserTmdbShowInfo,
} from "@media-center/domains/src/userTmdbInfo/domain/userTmdbInfo";
import { UserId } from "@media-center/domains/src/userTmdbInfo/domain/userTmdbInfoId";

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
