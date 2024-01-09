import {Movie} from '@media-center/server/src/domains/tmdb/domain/movie';
import {MovieCard} from '../implementedUi/cards/movieCard/movieCard';
import {SectionLine, ExtraSectionLineProps} from '../sectionLine/sectionLine';
import {UserTmdbMovieInfo} from '@media-center/server/src/domains/userTmdbInfo/domain/userTmdbInfo';

interface MovieCardsLine extends ExtraSectionLineProps<Movie> {
  movies: Movie[];
  infos?: UserTmdbMovieInfo[];
  title: string;
  autoFocusFirst?: boolean;
}

export function MovieCardsLine({
  movies,
  title,
  autoFocusFirst,
  infos,
  ...other
}: MovieCardsLine) {
  return (
    <SectionLine
      {...other}
      title={title}
      data={movies}
      keyExtractor={movie => movie.id.toString()}
      renderItem={(item, index) => (
        <MovieCard
          progress={infos?.find(e => e.id.equalsTmdbId(item.id))?.progress}
          focusOnMount={autoFocusFirst && index === 0}
          movie={item}
        />
      )}
    />
  );
}
