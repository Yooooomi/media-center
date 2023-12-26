import {useEffect, useMemo} from 'react';
import {GetEntriesQuery} from '@media-center/server/src/domains/catalog/applicative/getEntries.query';
import {
  MovieCatalogEntryFulfilled,
  ShowCatalogEntryFulfilled,
} from '@media-center/server/src/domains/catalog/applicative/catalogEntryFulfilled.front';
import {GetTmdbsQuery} from '@media-center/server/src/domains/tmdb/applicative/getTmdbs.query';
import {Movie} from '@media-center/server/src/domains/tmdb/domain/movie';
import {Show} from '@media-center/server/src/domains/tmdb/domain/show';
import ShowCardsLine from '../../components/showCardsLine/showCardsLine';
import MovieCardsLine from '../../components/movieCardsLine/movieCardsLine';
import {compact, keyBy} from '@media-center/algorithm';
import {useQuery} from '../../services/useQuery';
import Box from '../../components/box/box';
import FullScreenLoading from '../../components/fullScreenLoading/fullScreenLoading';
import {StatusContext} from '../../contexts/statusContext';

export default function AddedRecently() {
  const [{result: entries, error}] = useQuery(GetEntriesQuery, undefined, {
    alterResult: result =>
      result.sort(
        (a, b) =>
          (b.getLatestItem()?.item.addedAt.getTime() ?? 0) -
          (a.getLatestItem()?.item.addedAt.getTime() ?? 0),
      ),
  });
  const [{result: tmdbs}] = useQuery(
    GetTmdbsQuery,
    entries?.map(e => e.id) ?? [],
    {
      dependsOn: entries,
      alterResult: r => keyBy(r, tmdb => tmdb.id.toString()),
    },
  );

  const [movieEntries, showEntries] = useMemo<
    [MovieCatalogEntryFulfilled[], ShowCatalogEntryFulfilled[]]
  >(
    () =>
      entries
        ? [
            entries.filter(
              e => e instanceof MovieCatalogEntryFulfilled,
            ) as MovieCatalogEntryFulfilled[],
            entries.filter(
              e => e instanceof ShowCatalogEntryFulfilled,
            ) as ShowCatalogEntryFulfilled[],
          ]
        : [[], []],
    [entries],
  );

  const [movies, shows] = useMemo(
    () => [
      compact(
        movieEntries.map(m => {
          const movie = tmdbs?.[m.id.toString()];
          if (!movie || !(movie instanceof Movie)) {
            return undefined;
          }
          return movie;
        }),
      ),
      compact(
        showEntries.map(s => {
          const show = tmdbs?.[s.id.toString()];
          if (!show || !(show instanceof Show)) {
            return undefined;
          }
          return show;
        }),
      ),
    ],
    [movieEntries, showEntries, tmdbs],
  );

  useEffect(() => {
    if (error) {
      StatusContext.server.value = false;
    }
  }, [error]);

  if (!entries || !tmdbs) {
    return <FullScreenLoading />;
  }

  return (
    <Box row grow>
      <Box gap="S16" ml="S16" mt="S16">
        <ShowCardsLine
          autoFocusFirst
          title="Séries récement ajoutées"
          shows={shows}
        />
        <MovieCardsLine title="Films récement ajoutés" movies={movies} />
      </Box>
    </Box>
  );
}
