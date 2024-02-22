import { Event } from "@media-center/domain-driven";
import { UserTmdbInfoId } from "./userTmdbInfoId";

export class UserTmdbInfoUpdated extends Event({
  userTmdbInfoId: UserTmdbInfoId,
}) {}
