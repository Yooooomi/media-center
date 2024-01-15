import {useEffect} from 'react';
import {ShowCardsLine} from '../../components/showCardsLine/showCardsLine';
import {MovieCardsLine} from '../../components/movieCardsLine/movieCardsLine';
import {useQuery} from '../../services/useQuery';
import {Box} from '../../components/box/box';
import {FullScreenLoading} from '../../components/fullScreenLoading/fullScreenLoading';
import {StatusContext} from '../../contexts/statusContext';
import {HomepageQuery} from '@media-center/server/src/queries/homepage.query';
import {DownloadingCardLine} from '../../components/downloadingCardLine';
import {ScrollView} from 'react-native';
import {Beta} from '../../services/api';
import {TmdbCardsLine} from '../../components/tmdbCardsLine/tmdbCardsLine';
import {Text} from '../../components/text';
import {useMeshContext} from '../../contexts/meshContext';

export function AddedRecently() {
  const {setStatus} = useMeshContext(StatusContext);
  const [{result: homepage, error}] = useQuery(HomepageQuery, Beta.userId, {
    reactive: true,
  });

  useEffect(() => {
    if (error) {
      setStatus(false);
    }
  }, [error, setStatus]);

  if (!homepage) {
    return <FullScreenLoading />;
  }

  const downloading = homepage.downloading
    .filter(e => e.torrent.getClampedDownloaded() !== 1)
    .map(e => ({
      request: e.torrent,
      tmdb: e.tmdb,
    }));

  const hasNoContent =
    homepage.continue.length +
      homepage.catalog.shows.length +
      homepage.catalog.movies.length +
      downloading.length ===
    0;

  return (
    <ScrollView>
      <Box row grow>
        <Box gap="S16" ml="S16" mt="S16">
          {hasNoContent ? <Text>Vous n'avez aucun média</Text> : null}
          {homepage.continue.length > 0 ? (
            <TmdbCardsLine
              autoFocusFirst
              title="Continuer à regarder"
              tmdbs={homepage.continue.map(e => e.tmdb)}
              infos={homepage.continue.map(e => e.userInfo)}
            />
          ) : null}
          {homepage.catalog.shows.length > 0 ? (
            <ShowCardsLine
              autoFocusFirst={homepage.continue.length === 0}
              title="Séries récemment ajoutées"
              shows={homepage.catalog.shows.map(e => e.tmdb)}
            />
          ) : null}
          {homepage.catalog.movies.length > 0 ? (
            <MovieCardsLine
              autoFocusFirst={
                homepage.continue.length + homepage.catalog.shows.length === 0
              }
              title="Films récemment ajoutés"
              infos={homepage.catalog.movies.map(e => e.userInfo)}
              movies={homepage.catalog.movies.map(e => e.tmdb)}
            />
          ) : null}
          {downloading.length > 0 ? (
            <DownloadingCardLine
              title="En téléchargement"
              entries={downloading}
              autoFocusFirst={
                homepage.continue.length +
                  homepage.catalog.shows.length +
                  homepage.catalog.movies.length ===
                0
              }
            />
          ) : null}
        </Box>
      </Box>
    </ScrollView>
  );
}
