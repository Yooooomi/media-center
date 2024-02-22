import { Shape } from "@media-center/domain-driven";
import { maxBy } from "@media-center/algorithm";
import { UserTmdbInfoId } from "./userTmdbInfoId";

export class UserTmdbMovieInfo extends Shape({
  id: UserTmdbInfoId,
  progress: Number,
  updatedAt: Number,
}) {
  public setProgress(progress: number) {
    this.progress = progress;
    this.updatedAt = Date.now();
  }

  public markNotViewed() {
    this.setProgress(0);
  }

  public markViewed() {
    this.setProgress(1);
  }

  isFinished() {
    return this.progress > 0.9;
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
      (e) => e.season === season && e.episode === episode,
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

  public markEpisodeViewed(season: number, episode: number) {
    this.setEpisodeProgress(season, episode, 1);
  }

  public markEpisodeNotViewed(season: number, episode: number) {
    this.setEpisodeProgress(season, episode, 0);
  }

  public isEpisodeFinished(season: number, episode: number) {
    return this.getEpisodeProgress(season, episode) > 0.9;
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
      (progress) => progress.season * 10e9 + progress.episode,
    );
    return latest?.progress ?? 0;
  }

  getLastWatchedInfo() {
    const lastSeen = maxBy(this.progress, (p) => p.season);
    if (!lastSeen) {
      return undefined;
    }
    return { season: lastSeen.season, episode: lastSeen.episode };
  }
}

export type AnyUserTmdbInfo = UserTmdbMovieInfo | UserTmdbShowInfo;
