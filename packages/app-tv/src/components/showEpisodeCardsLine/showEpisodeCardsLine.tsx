import {ShowEpisode} from '@media-center/server/src/domains/tmdb/domain/showEpisode';
import {ShowEpisodeCard} from '../implementedUi/cards/showEpisodeCard/showEpisodeCard';
import {ShowCatalogEntryFulfilled} from '@media-center/server/src/domains/catalog/applicative/catalogEntryFulfilled.front';
import {UserTmdbShowInfo} from '@media-center/server/src/domains/userTmdbInfo/domain/userTmdbInfo';
import {Show} from '@media-center/server/src/domains/tmdb/domain/show';
import {LineList} from '../lineList';
import {StyleSheet} from 'react-native';

interface ShowEpisodeCardsLineProps {
  show: Show;
  showEpisodes: ShowEpisode[];
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
}: ShowEpisodeCardsLineProps) {
  return (
    <LineList
      style={styles.root}
      data={showEpisodes}
      keyExtractor={showEpisode => showEpisode.episode_number.toString()}
      renderItem={(item, index) => (
        <ShowEpisodeCard
          show={show}
          userInfo={userInfo}
          disabled={availableEpisodes.indexOf(item.episode_number) === -1}
          focusOnMount={
            focusIndex !== undefined && index === focusIndex ? true : undefined
          }
          catalogEntry={catalogEntry}
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
