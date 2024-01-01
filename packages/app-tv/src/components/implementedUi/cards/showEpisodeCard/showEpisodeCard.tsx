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

interface ShowEpisodeCardProps {
  showEpisode: ShowEpisode;
  catalogEntry: ShowCatalogEntryFulfilled;
  userInfo: UserTmdbShowInfo;
  focusOnMount?: boolean;
  disabled?: boolean;
}

export function ShowEpisodeCard({
  showEpisode,
  catalogEntry,
  focusOnMount,
  disabled,
  userInfo,
}: ShowEpisodeCardProps) {
  const imageUri = useImageUri(showEpisode.still_path);
  const {actionSheet, play} = usePlayCatalogEntry(
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
