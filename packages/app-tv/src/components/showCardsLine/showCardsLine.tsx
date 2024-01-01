import SectionLine, {ExtraSectionLineProps} from '../sectionLine/sectionLine';
import {ShowCard} from '../implementedUi/cards/showCard/showCard';
import {Show} from '@media-center/server/src/domains/tmdb/domain/show';
import {UserTmdbShowInfo} from '@media-center/server/src/domains/userTmdbInfo/domain/userTmdbInfo';

interface ShowCardsLine extends ExtraSectionLineProps<Show> {
  shows: Show[];
  infos?: UserTmdbShowInfo[];
  title: string;
  autoFocusFirst?: boolean;
}

export default function ShowCardsLine({
  shows,
  title,
  autoFocusFirst,
  infos,
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
          progress={infos
            ?.find(e => e.id.equalsTmdbId(item.id))
            ?.getShowProgress()}
          focusOnMount={autoFocusFirst && index === 0}
          show={item}
        />
      )}
    />
  );
}
