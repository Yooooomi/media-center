import {useEffect} from 'react';
import ShowCardsLine from '../../components/showCardsLine/showCardsLine';
import MovieCardsLine from '../../components/movieCardsLine/movieCardsLine';
import {useQuery} from '../../services/useQuery';
import Box from '../../components/box/box';
import FullScreenLoading from '../../components/fullScreenLoading/fullScreenLoading';
import {StatusContext} from '../../contexts/statusContext';
import {HomepageQuery} from '@media-center/server/src/queries/homepage.query';
import DownloadingCardLine from '../../components/downloadingCardLine';
import {ScrollView} from 'react-native';
import {Beta} from '../../services/api';
import TmdbCardsLine from '../../components/tmdbCardsLine/tmdbCardsLine';

export default function AddedRecently() {
  const [{result: homepage, error}] = useQuery(HomepageQuery, Beta.userId, {
    reactive: true,
  });

  useEffect(() => {
    if (error) {
      StatusContext.server.value = false;
    }
  }, [error]);

  if (!homepage) {
    return <FullScreenLoading />;
  }

  return (
    <ScrollView>
      <Box row grow>
        <Box gap="S16" ml="S16" mt="S16">
          <TmdbCardsLine
            autoFocusFirst
            title="Continuer à regarder"
            tmdbs={homepage.continue.map(e => e.tmdb)}
            infos={homepage.continue.map(e => e.userInfo)}
          />
          <ShowCardsLine
            title="Séries récement ajoutées"
            shows={homepage.catalog.shows.map(e => e.tmdb)}
          />
          <MovieCardsLine
            title="Films récement ajoutés"
            infos={homepage.catalog.movies.map(e => e.userInfo)}
            movies={homepage.catalog.movies.map(e => e.tmdb)}
          />
          <DownloadingCardLine
            title="En téléchargement"
            entries={homepage.downloading
              .filter(e => e.torrent.getClampedDownloaded() !== 1)
              .map(e => ({
                request: e.torrent,
                tmdb: e.tmdb,
              }))}
          />
        </Box>
      </Box>
    </ScrollView>
  );
}
