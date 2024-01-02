import {useImageUri} from '../../../../services/tmdb';
import {ShowEpisode} from '@media-center/server/src/domains/tmdb/domain/showEpisode';
import InfoCard from '../../../infoCard/infoCard';
import {usePlayCatalogEntry} from '../../../../services/usePlayCatalogEntry';
import {
  CatalogEntryShowSpecificationFulFilled,
  ShowCatalogEntryFulfilled,
} from '@media-center/server/src/domains/catalog/applicative/catalogEntryFulfilled.front';
import {useCallback} from 'react';
import {noop} from '@media-center/algorithm';
import {UserTmdbShowInfo} from '@media-center/server/src/domains/userTmdbInfo/domain/userTmdbInfo';
import {Show} from '@media-center/server/src/domains/tmdb/domain/show';

interface ShowEpisodeCardProps {
  show: Show;
  showEpisode: ShowEpisode;
  catalogEntry: ShowCatalogEntryFulfilled;
  userInfo: UserTmdbShowInfo;
  focusOnMount?: boolean;
  disabled?: boolean;
}

export function ShowEpisodeCard({
  show,
  showEpisode,
  catalogEntry,
  focusOnMount,
  disabled,
  userInfo,
}: ShowEpisodeCardProps) {
  const imageUri = useImageUri(showEpisode.still_path);
  const {actionSheet, play} = usePlayCatalogEntry(
    `${show.title} - ${showEpisode.name}`,
    catalogEntry,
    userInfo,
    useCallback(
      (item: CatalogEntryShowSpecificationFulFilled) =>
        item.season === showEpisode.season_number &&
        item.episode === showEpisode.episode_number,
      [showEpisode.episode_number, showEpisode.season_number],
    ),
  );

  return (
    <>
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
      {actionSheet}
    </>
  );
}
