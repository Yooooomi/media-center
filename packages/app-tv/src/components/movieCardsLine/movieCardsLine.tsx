import {Movie} from '@media-center/server/src/domains/tmdb/domain/movie';
import {MovieCard} from '../implementedUi/cards/movieCard/movieCard';
import {SectionLine} from '../sectionLine/sectionLine';
import {UserTmdbMovieInfo} from '@media-center/server/src/domains/userTmdbInfo/domain/userTmdbInfo';
import React from 'react';

interface MovieCardsLine {
  movies: Movie[];
  infos?: UserTmdbMovieInfo[];
  title: string;
  autoFocusFirst?: boolean;
  onFocus?: (movie: Movie) => void;
  itemPerLine?: number;
}

function MovieCardsLine_({
  movies,
  title,
  autoFocusFirst,
  infos,
  onFocus,
  itemPerLine,
}: MovieCardsLine) {
  return (
    <SectionLine
      title={title}
      data={movies}
      keyExtractor={movie => movie.id.toString()}
      itemPerLine={itemPerLine}
      renderItem={(item, index) => (
        <MovieCard
          onFocus={onFocus}
          progress={infos?.find(e => e.id.equalsTmdbId(item.id))?.progress}
          focusOnMount={autoFocusFirst && index === 0}
          movie={item}
        />
      )}
    />
  );
}

export const MovieCardsLine = React.memo(MovieCardsLine_);
