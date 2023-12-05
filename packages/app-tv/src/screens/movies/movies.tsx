import {Movie} from '@media-center/server/src/domains/tmdb/domain/movie';
import FullScreenLoading from '../../components/fullScreenLoading/fullScreenLoading';
import MovieCardsLine from '../../components/movieCardsLine/movieCardsLine';
import {useQuery} from '../../services/useQuery';
import {GetMovieEntriesQuery} from '@media-center/server/src/domains/catalog/applicative/getMovieEntries.query';
import {GetTmdbsQuery} from '@media-center/server/src/domains/tmdb/applicative/getTmdbs.query';
import Box from '../../components/box/box';
import {maxCardsPerLine} from '../../services/constants';

export default function Movies() {
  const [{result: movieEntries}] = useQuery(GetMovieEntriesQuery);
  const [{result: tmdbs}] = useQuery(
    GetTmdbsQuery,
    movieEntries?.map(e => e.id) ?? [],
    {
      alterResult: r =>
        r.sort((a, b) => a.title.localeCompare(b.title)) as Movie[],
      dependsOn: movieEntries,
    },
  );

  if (!movieEntries || !tmdbs) {
    return <FullScreenLoading />;
  }

  return (
    <Box grow p="S16">
      <MovieCardsLine
        autoFocusFirst
        title="Vos films"
        movies={tmdbs}
        itemPerLine={maxCardsPerLine}
      />
    </Box>
  );
}
