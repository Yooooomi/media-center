import {ShowEpisode} from '@media-center/server/src/domains/tmdb/domain/showEpisode';
import SectionLine, {ExtraSectionLineProps} from '../sectionLine/sectionLine';
import ShowEpisodeCard from '../showEpisodeCard/showEpisodeCard';
import {ShowSeason} from '@media-center/server/src/domains/tmdb/domain/showSeason';
import {ShowCatalogEntryFulfilled} from '@media-center/server/src/domains/catalog/applicative/catalogEntryFulfilled.front';

interface ShowEpisodeCardsLineProps extends ExtraSectionLineProps<ShowEpisode> {
  showSeason: ShowSeason;
  showEpisodes: ShowEpisode[];
  catalogEntry: ShowCatalogEntryFulfilled;
  onFocusEpisode?: (episode: ShowEpisode) => void;
  focusFirst?: boolean;
}

export default function ShowEpisodeCardsLine({
  showEpisodes,
  showSeason,
  catalogEntry,
  onFocusEpisode,
  focusFirst,
  ...other
}: ShowEpisodeCardsLineProps) {
  const getItem = (item: ShowEpisode) =>
    catalogEntry.items
      .filter(
        e =>
          e.season === item.season_number && e.episode === item.episode_number,
      )
      .map(e => e.item);

  return (
    <SectionLine
      {...other}
      data={showEpisodes}
      keyExtractor={showEpisode => showEpisode.episode_number.toString()}
      renderItem={(item, index) => (
        <ShowEpisodeCard
          hasTVPreferredFocus={focusFirst && index === 0 ? true : undefined}
          hierarchyItems={getItem(item)}
          showEpisode={item}
          onFocus={() => {
            onFocusEpisode?.(item);
          }}
        />
      )}
      title={`Episodes de la saison ${showSeason.season_number}`}
      subtitle={`${showSeason.episode_count} épisodes`}
    />
  );
}
