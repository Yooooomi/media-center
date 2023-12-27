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
import {useEvent} from '../../services/useEvent';
import {
  CatalogEntryAdded,
  CatalogEntryDeleted,
} from '@media-center/server/src/domains/catalog/applicative/catalog.events';

export default function AddedRecently() {
  const [{result: homepage, error}, _, reload] = useQuery(
    HomepageQuery,
    undefined,
  );

  useEvent(CatalogEntryAdded, reload);
  useEvent(CatalogEntryDeleted, reload);

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
          <ShowCardsLine
            autoFocusFirst
            title="Séries récement ajoutées"
            shows={homepage.catalog.shows.map(e => e.tmdb)}
          />
          <MovieCardsLine
            title="Films récement ajoutés"
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
