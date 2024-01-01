import {
  UserTmdbMovieInfo,
  UserTmdbShowInfo,
} from '@media-center/server/src/domains/userTmdbInfo/domain/userTmdbInfo';

export function progressFromUserInfo(
  info: UserTmdbMovieInfo | UserTmdbShowInfo | undefined,
  season?: number,
  episode?: number,
) {
  if (!info) {
    return 0;
  }
  if (info instanceof UserTmdbMovieInfo) {
    return info.progress;
  }
  if (
    info instanceof UserTmdbShowInfo &&
    season !== undefined &&
    episode !== undefined
  ) {
    return info.getEpisodeProgress(season, episode);
  }
  return 0;
}
