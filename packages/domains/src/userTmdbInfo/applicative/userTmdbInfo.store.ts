import { Store } from "@media-center/domain-driven";
import { AnyUserTmdbInfo } from "../domain/userTmdbInfo";
import { UserId } from "../domain/userTmdbInfoId";

export abstract class UserTmdbInfoStore extends Store<AnyUserTmdbInfo> {
  abstract loadByUserId(userId: UserId): Promise<AnyUserTmdbInfo[]>;
}
