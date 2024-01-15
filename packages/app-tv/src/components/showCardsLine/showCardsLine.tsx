import {SectionLine} from '../sectionLine/sectionLine';
import {ShowCard} from '../implementedUi/cards/showCard/showCard';
import {Show} from '@media-center/server/src/domains/tmdb/domain/show';
import {UserTmdbShowInfo} from '@media-center/server/src/domains/userTmdbInfo/domain/userTmdbInfo';
import React from 'react';

interface ShowCardsLine {
  shows: Show[];
  infos?: UserTmdbShowInfo[];
  title: string;
  autoFocusFirst?: boolean;
  onFocus?: (show: Show) => void;
  itemPerLine?: number;
}

function ShowCardsLine_({
  shows,
  title,
  autoFocusFirst,
  infos,
  onFocus,
  itemPerLine,
}: ShowCardsLine) {
  return (
    <SectionLine
      title={title}
      data={shows}
      keyExtractor={show => show.id.toString()}
      itemPerLine={itemPerLine}
      renderItem={(item, index) => (
        <ShowCard
          onFocus={onFocus}
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

export const ShowCardsLine = React.memo(ShowCardsLine_);
