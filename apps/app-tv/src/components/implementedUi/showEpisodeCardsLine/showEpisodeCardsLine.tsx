import {ShowEpisode} from '@media-center/domains/src/tmdb/domain/showEpisode';
import {ShowCatalogEntryFulfilled} from '@media-center/domains/src/catalog/applicative/catalogEntryFulfilled.front';
import {UserTmdbShowInfo} from '@media-center/domains/src/userTmdbInfo/domain/userTmdbInfo';
import {Show} from '@media-center/domains/src/tmdb/domain/show';
import {StyleSheet} from 'react-native';
import {useCallback, useMemo} from 'react';
import {LineList} from '../../ui/display/lineList';
import {Playlist} from '../../../screens/params';
import {ShowEpisodeCard} from '../cards/showEpisodeCard/showEpisodeCard';

interface ShowEpisodeCardsLineProps {
  show: Show;
  showEpisodes: ShowEpisode[];
  season: number;
  availableEpisodes: number[];
  userInfo: UserTmdbShowInfo;
  catalogEntry: ShowCatalogEntryFulfilled;
  onFocusEpisode?: (episode: ShowEpisode) => void;
  focusIndex?: number;
}

export function ShowEpisodeCardsLine({
  show,
  showEpisodes,
  availableEpisodes,
  catalogEntry,
  focusIndex,
  userInfo,
  season,
  onFocusEpisode,
}: ShowEpisodeCardsLineProps) {
  const playlist: Playlist<'show'> = useMemo(
    () => ({
      tmdbId: show.id,
      items: catalogEntry.dataset
        .filter(a => a.season === season)
        .sort((a, b) => a.episode - b.episode)
        .map(dataset => ({
          name: `${show.title} - ${
            showEpisodes.find(e => e.episode_number === dataset.episode)
              ?.name ?? ''
          }`,
          dataset,
          progress: userInfo.getEpisodeProgress(season, dataset.episode),
        })),
    }),
    [catalogEntry.dataset, season, show.id, show.title, showEpisodes, userInfo],
  );

  const renderItem = useCallback(
    (data: ShowEpisode, index: number) => {
      return (
        <ShowEpisodeCard
          show={show}
          playlist={playlist}
          userInfo={userInfo}
          disabled={availableEpisodes.indexOf(data.episode_number) === -1}
          focusOnMount={
            focusIndex !== undefined && index === focusIndex ? true : undefined
          }
          onFocus={onFocusEpisode}
          showEpisode={data}
        />
      );
    },
    [availableEpisodes, focusIndex, onFocusEpisode, playlist, show, userInfo],
  );

  return (
    <LineList
      style={styles.root}
      data={showEpisodes}
      keyExtractor={showEpisode => showEpisode.episode_number.toString()}
      renderItem={renderItem}
    />
  );
}

const styles = StyleSheet.create({
  root: {
    marginLeft: -8,
  },
});
