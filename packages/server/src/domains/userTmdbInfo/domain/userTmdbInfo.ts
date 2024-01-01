import { Shape } from "@media-center/domain-driven";
import { UserTmdbInfoId } from "./userTmdbInfoId";

export class UserTmdbMovieInfo extends Shape({
  id: UserTmdbInfoId,
  progress: Number,
}) {
  public setProgress(progress: number) {
    this.progress = progress;
  }
}

class UserTmdbShowEpisodeInfo extends Shape({
  season: Number,
  episode: Number,
  progress: Number,
}) {
  public setProgress(progress: number) {
    this.progress = progress;
  }
}

export class UserTmdbShowInfo extends Shape({
  id: UserTmdbInfoId,
  progress: [UserTmdbShowEpisodeInfo],
}) {
  public setEpisodeProgress(season: number, episode: number, progress: number) {
    const info = this.progress.find(
      (e) => e.season === season && e.episode === episode
    );
    if (!info) {
      const newInfo = new UserTmdbShowEpisodeInfo({
        season,
        episode,
        progress,
      });
      this.progress.push(newInfo);
    } else {
      info.setProgress(progress);
    }
  }
}

export type AnyUserTmdbInfo = UserTmdbMovieInfo | UserTmdbShowInfo;
