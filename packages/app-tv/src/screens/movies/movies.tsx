import {FullScreenLoading} from '../../components/fullScreenLoading/fullScreenLoading';
import {MovieCardsLine} from '../../components/movieCardsLine/movieCardsLine';
import {useQuery} from '../../services/useQuery';
import {GetMoviesPageQuery} from '@media-center/server/src/queries/getMoviesPage.query';
import {Box} from '../../components/box/box';
import {maxCardsPerLine} from '../../services/constants';

export function Movies() {
  const [{result: movies}] = useQuery(GetMoviesPageQuery, undefined);

  if (!movies) {
    return <FullScreenLoading />;
  }

  return (
    <Box grow p="S16">
      <MovieCardsLine
        autoFocusFirst
        title="Vos films"
        movies={movies}
        itemPerLine={maxCardsPerLine}
      />
    </Box>
  );
}
