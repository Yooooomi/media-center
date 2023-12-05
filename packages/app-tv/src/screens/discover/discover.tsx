import Box from '../../components/box';
import {DiscoverMovieQuery} from '@media-center/server/src/domains/tmdb/applicative/discoverMovie.query';
import ShowCardsLine from '../../components/showCardsLine/showCardsLine';
import MovieCardsLine from '../../components/movieCardsLine/movieCardsLine';
import {useQuery} from '../../services/useQuery';
import {DiscoverShowQuery} from '@media-center/server/src/domains/tmdb/applicative/discoverShow.query';
import FullScreenLoading from '../../components/fullScreenLoading/fullScreenLoading';

export default function Home() {
  const [{result: movies}] = useQuery(DiscoverMovieQuery);
  const [{result: shows}] = useQuery(DiscoverShowQuery);

  if (!movies || !shows) {
    return <FullScreenLoading />;
  }

  return (
    <Box ml="S8" mt="S8" grow>
      <MovieCardsLine
        autoFocusFirst
        title="Découvrir des films"
        movies={movies}
      />
      <ShowCardsLine title="Découvrir des séries" shows={shows} />
    </Box>
  );
}
