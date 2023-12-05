import {ShowSeason} from '@media-center/server/src/domains/tmdb/domain/showSeason';
import {Show} from '@media-center/server/src/domains/tmdb/domain/show';
import ShowSeasonCard from '../showSeasonCard/showSeasonCard';
import SectionLine, {ExtraSectionLineProps} from '../sectionLine/sectionLine';
import {ShowCatalogEntryFulfilled} from '@media-center/server/src/domains/catalog/applicative/catalogEntryFulfilled.front';

interface ShowSeasonCardsLine extends ExtraSectionLineProps<ShowSeason> {
  show: Show;
  seasons: ShowSeason[];
  catalogEntry: ShowCatalogEntryFulfilled;
  focusFirst?: boolean;
}

export default function ShowSeasonCardsLine({
  show,
  seasons,
  catalogEntry,
  focusFirst,
  ...other
}: ShowSeasonCardsLine) {
  return (
    <SectionLine
      {...other}
      title={`${seasons.length}/${show.season_count}`}
      data={seasons}
      renderItem={(item, index) => (
        <ShowSeasonCard
          hasTVPreferredFocus={focusFirst && index === 0 ? true : undefined}
          show={show}
          season={item}
          catalogEntry={catalogEntry}
        />
      )}
      keyExtractor={season => season.season_number.toString()}
    />
  );
}
