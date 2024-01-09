import { Shape } from "@media-center/domain-driven";
import { UserTmdbInfoId } from "./userTmdbInfoId";
import { maxBy } from "@media-center/algorithm";

export class UserTmdbMovieInfo extends Shape({
  id: UserTmdbInfoId,
  progress: Number,
  updatedAt: Number,
}) {
  public setProgress(progress: number) {
    this.progress = progress;
    this.updatedAt = Date.now();
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
  updatedAt: Number,
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
    this.updatedAt = Date.now();
  }

  getEpisodeProgress(season: number, episode: number) {
    return (
      this.progress.find((e) => e.season === season && e.episode === episode)
        ?.progress ?? 0
    );
  }

  getShowProgress() {
    const latest = maxBy(
      this.progress,
      (progress) => progress.season * 10e9 + progress.episode
    );
    return latest?.progress ?? 0;
  }

  getLastSeasonBegan() {
    return maxBy(this.progress, (p) => p.season)?.season;
  }
}

export type AnyUserTmdbInfo = UserTmdbMovieInfo | UserTmdbShowInfo;
