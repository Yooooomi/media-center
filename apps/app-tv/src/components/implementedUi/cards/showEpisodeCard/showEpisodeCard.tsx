import {ShowEpisode} from '@media-center/domains/src/tmdb/domain/showEpisode';
import {noop} from '@media-center/algorithm';
import {UserTmdbShowInfo} from '@media-center/domains/src/userTmdbInfo/domain/userTmdbInfo';
import {Show} from '@media-center/domains/src/tmdb/domain/show';
import {useCallback, useMemo} from 'react';
import {Playlist} from '../../../../screens/params';
import {usePlayCatalogEntry} from '../../../../services/hooks/usePlayCatalogEntry';
import {InfoCard} from '../../../ui/display/infoCard/infoCard';
import {useImageUri} from '../../../../services/tmdb';

interface ShowEpisodeCardProps {
  show: Show;
  showEpisode: ShowEpisode;
  userInfo: UserTmdbShowInfo;
  focusOnMount?: boolean;
  disabled?: boolean;
  playlist: Playlist<'show'>;
  onFocus?: (episode: ShowEpisode) => void;
}

export function ShowEpisodeCard({
  showEpisode,
  focusOnMount,
  disabled,
  userInfo,
  playlist,
  show,
  onFocus,
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

  const handleFocus = useCallback(() => {
    onFocus?.(showEpisode);
  }, [onFocus, showEpisode]);

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
      onFocus={handleFocus}
    />
  );
}
