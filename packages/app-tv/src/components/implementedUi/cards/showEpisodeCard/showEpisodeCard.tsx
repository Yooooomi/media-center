import {useImageUri} from '../../../../services/tmdb';
import {ShowEpisode} from '@media-center/server/src/domains/tmdb/domain/showEpisode';
import InfoCard from '../../../infoCard/infoCard';
import {usePlayCatalogEntry} from '../../../../services/usePlayCatalogEntry';
import {
  CatalogEntryShowSpecificationFulFilled,
  ShowCatalogEntryFulfilled,
} from '@media-center/server/src/domains/catalog/applicative/catalogEntryFulfilled.front';
import {useCallback} from 'react';

interface ShowEpisodeCardProps {
  showEpisode: ShowEpisode;
  catalogEntry: ShowCatalogEntryFulfilled;
  focusOnMount?: boolean;
}

export function ShowEpisodeCard({
  showEpisode,
  catalogEntry,
  focusOnMount,
}: ShowEpisodeCardProps) {
  const imageUri = useImageUri(showEpisode.still_path);
  const {actionSheet, play} = usePlayCatalogEntry(
    catalogEntry,
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
        onPress={play}
        imageUri={imageUri}
      />
      {actionSheet}
    </>
  );
}
