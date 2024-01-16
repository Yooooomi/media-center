import {useImageUri} from '../../../../services/tmdb';
import {ShowEpisode} from '@media-center/server/src/domains/tmdb/domain/showEpisode';
import {InfoCard} from '../../../infoCard/infoCard';
import {usePlayCatalogEntry} from '../../../../services/usePlayCatalogEntry';
import {noop} from '@media-center/algorithm';
import {UserTmdbShowInfo} from '@media-center/server/src/domains/userTmdbInfo/domain/userTmdbInfo';
import {Show} from '@media-center/server/src/domains/tmdb/domain/show';
import {Playlist} from '../../../../screens/params';
import {useMemo} from 'react';

interface ShowEpisodeCardProps {
  show: Show;
  showEpisode: ShowEpisode;
  userInfo: UserTmdbShowInfo;
  focusOnMount?: boolean;
  disabled?: boolean;
  playlist: Playlist<'show'>;
}

export function ShowEpisodeCard({
  showEpisode,
  focusOnMount,
  disabled,
  userInfo,
  playlist,
  show,
}: ShowEpisodeCardProps) {
  const imageUri = useImageUri(showEpisode.still_path);
  const index = useMemo(
    () =>
      playlist.items.findIndex(e => {
        return (
          e.dataset.season === showEpisode.season_number &&
          e.dataset.episode === showEpisode.episode_number
        );
      }),
    [playlist.items, showEpisode.episode_number, showEpisode.season_number],
  );

  const {play} = usePlayCatalogEntry(show.title, playlist, index);

  return (
    <InfoCard
      progress={userInfo.getEpisodeProgress(
        showEpisode.season_number,
        showEpisode.episode_number,
      )}
      focusOnMount={focusOnMount}
      pillText={`Episode ${showEpisode.episode_number}`}
      title={showEpisode.name}
      subtitle={`${showEpisode.runtime} minutes`}
      onPress={disabled ? noop : play}
      imageUri={imageUri}
      disabled={disabled}
    />
  );
}
