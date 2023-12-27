import { Shape } from "@media-center/domain-driven";
import { UserTmdbInfoId } from "./userTmdbInfoId";

export class UserTmdbInfo extends Shape({
  id: UserTmdbInfoId,
  progress: Number,
}) {
  public setProgress(progress: number) {
    this.progress = progress;
  }
}
