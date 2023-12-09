import {Movie} from '@media-center/server/src/domains/tmdb/domain/movie';
import {MovieCard} from '../implementedUi/cards/movieCard/movieCard';
import SectionLine, {ExtraSectionLineProps} from '../sectionLine/sectionLine';

interface MovieCardsLine extends ExtraSectionLineProps<Movie> {
  movies: Movie[];
  title: string;
  autoFocusFirst?: boolean;
}

export default function MovieCardsLine({
  movies,
  title,
  autoFocusFirst,
  ...other
}: MovieCardsLine) {
  return (
    <SectionLine
      {...other}
      title={title}
      data={movies}
      keyExtractor={movie => movie.id.toString()}
      renderItem={(item, index) => (
        <MovieCard focusOnMount={autoFocusFirst && index === 0} movie={item} />
      )}
    />
  );
}
