import {ShowEpisode} from '@media-center/server/src/domains/tmdb/domain/showEpisode';
import {ShowEpisodeCard} from '../implementedUi/cards/showEpisodeCard/showEpisodeCard';
import {ShowCatalogEntryFulfilled} from '@media-center/server/src/domains/catalog/applicative/catalogEntryFulfilled.front';
import {UserTmdbShowInfo} from '@media-center/server/src/domains/userTmdbInfo/domain/userTmdbInfo';
import {Show} from '@media-center/server/src/domains/tmdb/domain/show';
import {LineList} from '../lineList';

interface ShowEpisodeCardsLineProps {
  show: Show;
  showEpisodes: ShowEpisode[];
  availableEpisodes: number[];
  userInfo: UserTmdbShowInfo;
  catalogEntry: ShowCatalogEntryFulfilled;
  onFocusEpisode?: (episode: ShowEpisode) => void;
  focusFirst?: boolean;
}

export function ShowEpisodeCardsLine({
  show,
  showEpisodes,
  availableEpisodes,
  catalogEntry,
  focusFirst,
  userInfo,
}: ShowEpisodeCardsLineProps) {
  return (
    <LineList
      data={showEpisodes}
      keyExtractor={showEpisode => showEpisode.episode_number.toString()}
      renderItem={(item, index) => (
        <ShowEpisodeCard
          show={show}
          userInfo={userInfo}
          disabled={availableEpisodes.indexOf(item.episode_number) === -1}
          focusOnMount={focusFirst && index === 0 ? true : undefined}
          catalogEntry={catalogEntry}
          showEpisode={item}
        />
      )}
    />
  );
}
