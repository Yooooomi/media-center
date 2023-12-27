import {
  InMemoryStore,
  SerializableSerializer,
} from "@media-center/domain-driven";
import { UserTmdbInfoStore } from "../applicative/userTmdbInfo.store";
import { UserTmdbInfo } from "../domain/userTmdbInfo";

export class InMemoryUserTmdbInfoStore
  extends InMemoryStore<UserTmdbInfo>
  implements UserTmdbInfoStore
{
  constructor() {
    super(new SerializableSerializer(UserTmdbInfo));
  }
}
