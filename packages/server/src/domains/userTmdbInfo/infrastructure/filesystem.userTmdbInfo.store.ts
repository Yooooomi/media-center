import {
  Either,
  InMemoryDatabase,
  SerializableSerializer,
} from "@media-center/domain-driven";
import { UserTmdbInfoStore } from "../applicative/userTmdbInfo.store";
import { FilesystemStore } from "../../../framework/store";
import { EnvironmentHelper } from "../../environment/applicative/environmentHelper";
import {
  AnyUserTmdbInfo,
  UserTmdbMovieInfo,
  UserTmdbShowInfo,
} from "../domain/userTmdbInfo";

export class FilesystemUserTmdbInfoStore
  extends FilesystemStore<AnyUserTmdbInfo>
  implements UserTmdbInfoStore
{
  constructor(
    environmentHelper: EnvironmentHelper,
    database: InMemoryDatabase
  ) {
    super(
      environmentHelper,
      database,
      "userTmdbInfo",
      new SerializableSerializer(Either(UserTmdbMovieInfo, UserTmdbShowInfo))
    );
  }
}
