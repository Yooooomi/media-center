import {
  InMemoryDatabase,
  SerializableSerializer,
} from "@media-center/domain-driven";
import { UserTmdbInfoStore } from "../applicative/userTmdbInfo.store";
import { UserTmdbInfo } from "../domain/userTmdbInfo";
import { FilesystemStore } from "../../../framework/store";
import { EnvironmentHelper } from "../../environment/applicative/environmentHelper";

export class FilesystemUserTmdbInfoStore
  extends FilesystemStore<UserTmdbInfo>
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
      new SerializableSerializer(UserTmdbInfo)
    );
  }
}
