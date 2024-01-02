import {ShowEpisode} from '@media-center/server/src/domains/tmdb/domain/showEpisode';
import SectionLine, {ExtraSectionLineProps} from '../sectionLine/sectionLine';
import {ShowEpisodeCard} from '../implementedUi/cards/showEpisodeCard/showEpisodeCard';
import {ShowSeason} from '@media-center/server/src/domains/tmdb/domain/showSeason';
import {ShowCatalogEntryFulfilled} from '@media-center/server/src/domains/catalog/applicative/catalogEntryFulfilled.front';
import {UserTmdbShowInfo} from '@media-center/server/src/domains/userTmdbInfo/domain/userTmdbInfo';
import {Show} from '@media-center/server/src/domains/tmdb/domain/show';

interface ShowEpisodeCardsLineProps extends ExtraSectionLineProps<ShowEpisode> {
  show: Show;
  showSeason: ShowSeason;
  showEpisodes: ShowEpisode[];
  availableEpisodes: number[];
  userInfo: UserTmdbShowInfo;
  catalogEntry: ShowCatalogEntryFulfilled;
  onFocusEpisode?: (episode: ShowEpisode) => void;
  focusFirst?: boolean;
}

export default function ShowEpisodeCardsLine({
  show,
  showEpisodes,
  showSeason,
  availableEpisodes,
  catalogEntry,
  focusFirst,
  userInfo,
  ...other
}: ShowEpisodeCardsLineProps) {
  return (
    <SectionLine
      {...other}
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
      title={`Episodes de la saison ${showSeason.season_number}`}
      subtitle={`${showSeason.episode_count} épisodes`}
    />
  );
}
