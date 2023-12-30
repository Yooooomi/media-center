import {
  InMemoryDatabase,
  InMemoryStore,
  SerializableSerializer,
} from "@media-center/domain-driven";
import { UserTmdbInfoStore } from "../applicative/userTmdbInfo.store";
import { UserTmdbInfo } from "../domain/userTmdbInfo";

export class InMemoryUserTmdbInfoStore
  extends InMemoryStore<UserTmdbInfo>
  implements UserTmdbInfoStore
{
  constructor(database: InMemoryDatabase) {
    super(database, "userTmdbInfo", new SerializableSerializer(UserTmdbInfo));
  }
}
