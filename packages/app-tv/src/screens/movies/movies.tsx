import {GetMoviesPageQuery} from '@media-center/server/src/queries/getMoviesPage.query';
import {FullScreenLoading} from '../../components/ui/display/fullScreenLoading/fullScreenLoading';
import {MovieCardsLine} from '../../components/implementedUi/movieCardsLine/movieCardsLine';
import {useQuery} from '../../services/hooks/useQuery';
import {Box} from '../../components/ui/display/box/box';
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
