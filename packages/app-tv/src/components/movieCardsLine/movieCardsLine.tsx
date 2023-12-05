import {Movie} from '@media-center/server/src/domains/tmdb/domain/movie';
import MovieCard from '../movieCard/movieCard';
import SectionLine, {ExtraSectionLineProps} from '../sectionLine/sectionLine';

interface MovieCardsLine extends ExtraSectionLineProps<Movie> {
  movies: Movie[];
  title: string;
  autoFocusFirst?: boolean;
  numberOfLines?: number;
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
      renderItem={(item, index) => (
        <MovieCard
          hasTVPreferredFocus={autoFocusFirst && index === 0}
          movie={item}
        />
      )}
      keyExtractor={movie => movie.id.toString()}
    />
  );
}
