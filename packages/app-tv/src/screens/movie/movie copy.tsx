import {SafeAreaView, ScrollView, StyleSheet} from 'react-native';
import {useParams} from '../params';
import {useImageUri} from '../../services/tmdb';
import Text from '../../components/text/text';
import Section from '../../components/section/section';
import {GetEntryQuery} from '@media-center/server/src/domains/catalog/applicative/getEntry.query';
import Box from '../../components/box/box';
import TorrentRequestLine from '../../components/torrentRequestLine/torrentRequestLine';
import IconButton from '../../components/iconButton/iconButton';
import HierarchyItemLine from '../../components/hierarchyItemLine/hierarchyItemLine';
import {GetTorrentRequestsQuery} from '@media-center/server/src/domains/torrentRequest/applicative/getTorrentRequests.query';
import {GetMovieDetailsQuery} from '@media-center/server/src/domains/tmdb/applicative/getMovieDetails.query';
import QueryTorrents from '../../components/queryTorrents/queryTorrents';
import {useQuery} from '../../services/useQuery';
import {PageBackground} from '../../components/pageBackground/pageBackground';

export default function Movie() {
  const {movie} = useParams<'Movie'>();
  const imageUri = useImageUri(movie.backdrop_path, true);

  const [{result: details}] = useQuery(GetMovieDetailsQuery, {
    tmdbId: movie.id,
  });
  const [
    {result: existingTorrents},
    loadingExistingTorrents,
    reloadExistingTorrents,
  ] = useQuery(GetTorrentRequestsQuery, {
    tmdbId: movie.id,
  });
  const [{result: existingEntry}, loadingExistingEntry, reloadExistingEntry] =
    useQuery(GetEntryQuery, {
      tmdbId: movie.id,
    });

  const hasDownloaded = existingEntry && existingEntry.items.length > 0;
  const hasDownloading = existingTorrents && existingTorrents.length > 0;
  const loading = loadingExistingTorrents || loadingExistingEntry;

  const reload = () => {
    reloadExistingEntry();
    reloadExistingTorrents();
  };

  return (
    <>
      <ScrollView contentContainerStyle={styles.scrollview}>
        <PageBackground imageUri={imageUri} />
        <Box p="S32" row content="space-between" items="flex-end">
          <Box w="70%">
            <Box>
              <Text color="whiteText" size="big">
                {movie.title}
              </Text>
            </Box>
            <Box row gap="S12" mv="S8" p="S4" r="small">
              <Text size="default" color="text">
                {movie.getYear().toString()}
              </Text>
              {details && (
                <>
                  <Text size="default" color="text">
                    {details.getStringRuntime()}
                  </Text>
                  <Text size="default" color="text">
                    {details.genres.join(', ')}
                  </Text>
                </>
              )}
              <Text size="default" color="text">
                {movie.getRoundedNote()}/10
              </Text>
            </Box>
            <Text color="whiteText" size="default">
              {movie.overview}
            </Text>
          </Box>
          <Box row gap="S8">
            <IconButton
              type="primary"
              icon="refresh"
              loading={loading}
              onPress={reload}
            />
            <QueryTorrents
              tmdbId={movie.id}
              name={movie.title}
              onDownloaded={reload}
            />
          </Box>
        </Box>
        <Box ph="S32" mt="S16">
          <Section title="Téléchargés" mb="S32">
            <>
              {!hasDownloaded && (
                <Text color="text">Aucun fichier téléchargé</Text>
              )}
              {existingEntry?.items.map((item, index) => (
                <HierarchyItemLine
                  key={item.item.id.toString()}
                  hasTVPreferredFocus={index === 0}
                  item={item.item}
                />
              ))}
            </>
          </Section>
          <Section title="Téléchargements en cours" mb="S32">
            {!hasDownloading && (
              <Text color="text">Aucun fichier en téléchargement</Text>
            )}
            {existingTorrents?.map(torrent => (
              <TorrentRequestLine
                key={torrent.id.toString()}
                torrentRequest={torrent}
              />
            ))}
          </Section>
        </Box>
      </ScrollView>
      <SafeAreaView />
    </>
  );
}

const styles = StyleSheet.create({
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  scrollview: {
    flexGrow: 1,
  },
});
