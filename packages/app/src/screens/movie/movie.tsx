import {SafeAreaView, ScrollView, StyleSheet, View} from 'react-native';
import {useParams} from '../params';
import LoggedImage from '../../components/loggedImage/loggedImage';
import {useImageUri} from '../../services/tmdb';
import Text from '../../components/text/text';
import {spacing} from '../../services/constants';
import Button from '../../components/button/button';
import {useCallback, useEffect, useState} from 'react';
import {api} from '../../services/api';
import TorrentsActionSheet from '../../components/torrentsActionSheet/torrentsActionSheet';
import {TorrentIndexerResult} from '@media-center/server/src/domains/torrentIndexer/domain/torrentIndexerResult';
import {TorrentRequest} from '@media-center/server/src/domains/torrentRequest/domain/torrentRequest';
import Section from '../../components/section/section';
import {CatalogEntryFulfilled} from '@media-center/server/src/domains/catalog/applicative/getEntry.query';

export default function Movie() {
  const {movie} = useParams<'Movie'>();
  const imageUri = useImageUri(movie.backdrop_path);
  const [loading, setLoading] = useState(false);
  const [torrents, setTorrents] = useState<TorrentIndexerResult[] | undefined>(
    undefined,
  );

  const [existingEntry, setExistingEntry] = useState<
    CatalogEntryFulfilled | undefined
  >(undefined);
  const [existingTorrents, setExistingTorrents] = useState<TorrentRequest[]>(
    [],
  );

  useEffect(() => {
    async function get() {
      const r = await api.getTorrentRequests({tmdbId: movie.id.toString()});
      const entry = await api.getEntry({tmdbId: movie.id.toString()});
      setExistingTorrents(r);
      setExistingEntry(entry);
    }
    get().catch(console.error);
  }, [movie.id]);

  const queryTorrents = useCallback(async () => {
    setLoading(true);
    try {
      const d = await api.searchTorrentsForTmdb({tmdbId: movie.id.toString()});
      setTorrents(d);
    } catch (e) {}
    setLoading(false);
  }, [movie.id]);

  const downloadTorrent = useCallback(
    async (torrent: TorrentIndexerResult) => {
      await api.addTorrentRequest({
        torrentId: torrent.id.toString(),
        tmdbId: movie.id.toString(),
        name: torrent.name,
      });
    },
    [movie.id],
  );

  return (
    <>
      <View style={styles.header}>
        <LoggedImage style={styles.headerBackground} uri={imageUri} />
        <View style={styles.title}>
          <Text bold color="white" size="big">
            {movie.title}
          </Text>
          <Button
            type="secondary"
            text="Télécharger"
            onPress={queryTorrents}
            loading={loading}
          />
        </View>
      </View>
      <ScrollView style={styles.scrollview}>
        <Section title="Téléchargements en cours" ph="S16" mt="S16">
          {existingTorrents.map(torrent => (
            <View key={torrent.data.id.toString()}>
              <Text>{torrent.data.name}</Text>
            </View>
          ))}
        </Section>
        <Section title="Téléchargés" ph="S16" mt="S16">
          <>
            {existingEntry?.data.items.map(item => (
              <View key={item.data.id.toString()}>
                <Text>{item.data.file.getFilename()}</Text>
              </View>
            ))}
          </>
        </Section>
      </ScrollView>
      <SafeAreaView />
      <TorrentsActionSheet
        open={Boolean(torrents)}
        torrents={torrents ?? []}
        onTorrentPress={downloadTorrent}
      />
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 400,
    width: '100%',
  },
  headerBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  title: {
    marginTop: 'auto',
    marginBottom: spacing.S16,
    marginHorizontal: spacing.S16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scrollview: {
    flexGrow: 1,
  },
});
