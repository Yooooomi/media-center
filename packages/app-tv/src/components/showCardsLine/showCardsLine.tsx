import SectionLine, {ExtraSectionLineProps} from '../sectionLine/sectionLine';
import ShowCard from '../showCard/showCard';
import {Show} from '@media-center/server/src/domains/tmdb/domain/show';

interface ShowCardsLine extends ExtraSectionLineProps<Show> {
  shows: Show[];
  title: string;
  autoFocusFirst?: boolean;
}

export default function ShowCardsLine({
  shows,
  title,
  autoFocusFirst,
  ...other
}: ShowCardsLine) {
  return (
    <SectionLine
      {...other}
      title={title}
      data={shows}
      keyExtractor={show => show.id.toString()}
      renderItem={(item, index) => (
        <ShowCard
          hasTVPreferredFocus={autoFocusFirst && index === 0}
          show={item}
        />
      )}
    />
  );
}
