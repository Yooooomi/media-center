import {Box} from '../../components/box';
import {DiscoverPageQuery} from '@media-center/server/src/queries/discoverPage.query';
import {ShowCardsLine} from '../../components/showCardsLine/showCardsLine';
import {MovieCardsLine} from '../../components/movieCardsLine/movieCardsLine';
import {useQuery} from '../../services/useQuery';
import {FullScreenLoading} from '../../components/fullScreenLoading/fullScreenLoading';

export function Discover() {
  const [{result: discoverPage}] = useQuery(DiscoverPageQuery, undefined);

  if (!discoverPage) {
    return <FullScreenLoading />;
  }

  return (
    <Box ml="S8" mt="S8" grow>
      <MovieCardsLine
        autoFocusFirst
        title="Découvrir des films"
        movies={discoverPage.movies}
      />
      <ShowCardsLine title="Découvrir des séries" shows={discoverPage.shows} />
    </Box>
  );
}
