import {ShowEpisode} from '@media-center/server/src/domains/tmdb/domain/showEpisode';
import {ShowEpisodeCard} from '../implementedUi/cards/showEpisodeCard/showEpisodeCard';
import {ShowCatalogEntryFulfilled} from '@media-center/server/src/domains/catalog/applicative/catalogEntryFulfilled.front';
import {UserTmdbShowInfo} from '@media-center/server/src/domains/userTmdbInfo/domain/userTmdbInfo';
import {Show} from '@media-center/server/src/domains/tmdb/domain/show';
import {LineList} from '../lineList';
import {StyleSheet} from 'react-native';
import {Playlist} from '../../screens/params';
import {useMemo} from 'react';

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
}: ShowEpisodeCardsLineProps) {
  const playlist: Playlist<'show'> = useMemo(
    () => ({
      tmdbId: show.id,
      items: catalogEntry.dataset
        .filter(a => a.season === season)
        .sort((a, b) => a.episode - b.episode)
        .map(dataset => ({
          dataset,
          progress: userInfo.getEpisodeProgress(season, dataset.episode),
        })),
    }),
    [catalogEntry.dataset, season, show.id, userInfo],
  );

  return (
    <LineList
      style={styles.root}
      data={showEpisodes}
      keyExtractor={showEpisode => showEpisode.episode_number.toString()}
      renderItem={(item, index) => (
        <ShowEpisodeCard
          show={show}
          playlist={playlist}
          userInfo={userInfo}
          disabled={availableEpisodes.indexOf(item.episode_number) === -1}
          focusOnMount={
            focusIndex !== undefined && index === focusIndex ? true : undefined
          }
          showEpisode={item}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  root: {
    marginLeft: -8,
  },
});
