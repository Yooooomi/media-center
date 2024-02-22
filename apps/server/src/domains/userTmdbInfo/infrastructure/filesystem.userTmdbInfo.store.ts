import {
  Either,
  InMemoryDatabase,
  SerializableSerializer,
} from "@media-center/domain-driven";
import { EnvironmentHelper } from "@media-center/domains/src/environment/applicative/environmentHelper";
import { UserTmdbInfoStore } from "@media-center/domains/src/userTmdbInfo/applicative/userTmdbInfo.store";
import {
  AnyUserTmdbInfo,
  UserTmdbMovieInfo,
  UserTmdbShowInfo,
} from "@media-center/domains/src/userTmdbInfo/domain/userTmdbInfo";
import { UserId } from "@media-center/domains/src/userTmdbInfo/domain/userTmdbInfoId";
import { FilesystemStore } from "../../../framework/store";

export class FilesystemUserTmdbInfoStore
  extends FilesystemStore<AnyUserTmdbInfo>
  implements UserTmdbInfoStore
{
  constructor(
    environmentHelper: EnvironmentHelper,
    database: InMemoryDatabase,
  ) {
    super(
      environmentHelper,
      database,
      "userTmdbInfo",
      new SerializableSerializer(Either(UserTmdbMovieInfo, UserTmdbShowInfo)),
    );
  }

  async loadByUserId(userId: UserId) {
    return this.filter((e) => e.id.equalsUserId(userId));
  }
}
