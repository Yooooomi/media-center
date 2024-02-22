import {Show} from '@media-center/domains/src/tmdb/domain/show';
import {UserTmdbShowInfo} from '@media-center/domains/src/userTmdbInfo/domain/userTmdbInfo';
import React from 'react';
import {ShowCard} from '../cards/showCard/showCard';
import {SectionLine} from '../../ui/display/sectionLine/sectionLine';

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
