import { Store } from "@media-center/domain-driven";
import { UserTmdbInfo } from "../domain/userTmdbInfo";

export abstract class UserTmdbInfoStore extends Store<UserTmdbInfo> {}
