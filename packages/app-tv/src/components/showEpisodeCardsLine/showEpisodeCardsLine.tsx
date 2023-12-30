import {ShowEpisode} from '@media-center/server/src/domains/tmdb/domain/showEpisode';
import SectionLine, {ExtraSectionLineProps} from '../sectionLine/sectionLine';
import {ShowEpisodeCard} from '../implementedUi/cards/showEpisodeCard/showEpisodeCard';
import {ShowSeason} from '@media-center/server/src/domains/tmdb/domain/showSeason';
import {ShowCatalogEntryFulfilled} from '@media-center/server/src/domains/catalog/applicative/catalogEntryFulfilled.front';

interface ShowEpisodeCardsLineProps extends ExtraSectionLineProps<ShowEpisode> {
  showSeason: ShowSeason;
  showEpisodes: ShowEpisode[];
  availableEpisodes: number[];
  catalogEntry: ShowCatalogEntryFulfilled;
  onFocusEpisode?: (episode: ShowEpisode) => void;
  focusFirst?: boolean;
}

export default function ShowEpisodeCardsLine({
  showEpisodes,
  showSeason,
  availableEpisodes,
  catalogEntry,
  focusFirst,
  ...other
}: ShowEpisodeCardsLineProps) {
  return (
    <SectionLine
      {...other}
      data={showEpisodes}
      keyExtractor={showEpisode => showEpisode.episode_number.toString()}
      renderItem={(item, index) => (
        <ShowEpisodeCard
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
