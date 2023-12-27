import { SerializableSerializer } from "@media-center/domain-driven";
import { FilesystemStore } from "../../../framework/store";
import { UserTmdbInfoStore } from "../applicative/userTmdbInfo.store";
import { UserTmdbInfo } from "../domain/userTmdbInfo";

export class FilesystemUserTmdbInfoStore
  extends FilesystemStore<UserTmdbInfo>
  implements UserTmdbInfoStore
{
  constructor() {
    super(new SerializableSerializer(UserTmdbInfo));
  }
}
