import { Store } from "@media-center/domain-driven";
import { AnyUserTmdbInfo } from "../domain/userTmdbInfo";

export abstract class UserTmdbInfoStore extends Store<AnyUserTmdbInfo> {}
