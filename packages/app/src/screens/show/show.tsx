import {SafeAreaView, ScrollView, StyleSheet, View} from 'react-native';
import {useParams} from '../params';
import LoggedImage from '../../components/loggedImage/loggedImage';
import {useImageUri} from '../../services/tmdb';
import Text from '../../components/text/text';
import Button from '../../components/button/button';
import {useCallback, useEffect, useState} from 'react';
import TorrentsActionSheet from '../../components/torrentsActionSheet/torrentsActionSheet';
import {TorrentIndexerResult} from '@media-center/server/src/domains/torrentIndexer/domain/torrentIndexerResult';
import {SearchTorrentsQuery} from '@media-center/server/src/domains/torrentIndexer/applicative/searchTorrents.query';
import {GetTorrentRequestsQuery} from '@media-center/server/src/domains/torrentRequest/applicative/getTorrentRequests.query';
import {AddTorrentRequestCommand} from '@media-center/server/src/domains/torrentRequest/applicative/addTorrentRequest.command';
import {TorrentRequest} from '@media-center/server/src/domains/torrentRequest/domain/torrentRequest';
import Section from '../../components/section/section';
import {
  CatalogEntryFulfilled,
  GetEntryQuery,
} from '@media-center/server/src/domains/catalog/applicative/getEntry.query';
import Box from '../../components/box/box';
import {useBooleanState} from '../../services/useBooleanState';
import TorrentRequestLine from '../../components/torrentRequestLine/torrentRequestLine';
import IconButton from '../../components/iconButton/iconButton';
import HierarchyItemLine from '../../components/hierarchyItemLine/hierarchyItemLine';
import {Beta} from '../../services/api';

export default function Show() {
  const {show} = useParams<'Show'>();
  const imageUri = useImageUri(show.backdrop_path, true);
  const [loading, setLoading] = useState(false);
  const [torrents, setTorrents] = useState<TorrentIndexerResult[] | undefined>(
    undefined,
  );
  const [actionSheetOpen, openActionSheet, closeActionSheet] =
    useBooleanState();
  const [fetching, setFetching, setFetched] = useBooleanState();

  const [existingEntry, setExistingEntry] = useState<
    CatalogEntryFulfilled | undefined
  >(undefined);
  const [existingTorrents, setExistingTorrents] = useState<TorrentRequest[]>(
    [],
  );

  const fetch = useCallback(async () => {
    setFetching();
    try {
      const r = await Beta.query(
        new GetTorrentRequestsQuery({tmdbId: show.id}),
      );
      const entry = await Beta.query(new GetEntryQuery({tmdbId: show.id}));
      setExistingTorrents(r);
      setExistingEntry(entry);
    } catch (e) {
      console.error(e);
    }
    setFetched();
  }, [show.id, setFetched, setFetching]);

  useEffect(() => {
    fetch().catch(console.error);
  }, [fetch]);

  const queryTorrents = useCallback(async () => {
    setLoading(true);
    try {
      const d = await Beta.query(new SearchTorrentsQuery({tmdbId: show.id}));
      setTorrents(d);
      openActionSheet();
    } catch (e) {}
    setLoading(false);
  }, [show.id, openActionSheet]);

  const downloadTorrent = useCallback(
    async (torrent: TorrentIndexerResult) => {
      closeActionSheet();
      await Beta.command(
        new AddTorrentRequestCommand({
          torrentId: torrent.id,
          tmdbId: show.id,
        }),
      );
      await fetch();
    },
    [closeActionSheet, fetch, show.id],
  );

  const hasDownloaded = existingEntry && existingEntry.items.length > 0;
  const hasDownloading = existingTorrents.length > 0;

  return (
    <>
      <View style={styles.background}>
        <LoggedImage
          blurRadius={200}
          style={StyleSheet.absoluteFill}
          uri={imageUri}
        />
      </View>
      <Box p="S32" row content="space-between" items="flex-end">
        <Box width="70%">
          <Box mb="S16">
            <Text color="white" size="big">
              {show.title}
            </Text>
          </Box>
          <Text color="greyed" size="default">
            {show.overview}
          </Text>
          <Box row mv="S16" gap="S8">
            <Text color="greyed">{show.getYear().toString()}</Text>
            <Text color="greyed">{show.getRoundedNote()}</Text>
          </Box>
        </Box>
        <Box row gap="S8">
          <IconButton
            type="primary"
            icon="refresh"
            loading={fetching}
            onPress={fetch}
          />
          <Button
            type="primary"
            text="Télécharger"
            onPress={queryTorrents}
            loading={loading}
          />
        </Box>
      </Box>
      <ScrollView style={styles.scrollview}>
        <Box ph="S32" mt="S16">
          <Section
            title="Téléchargés"
            mb="S32"
            textProps={{color: 'white', bold: false}}>
            <>
              {!hasDownloaded && (
                <Text color="grey">Aucun fichier téléchargé</Text>
              )}
              {existingEntry?.items.map(item => (
                <HierarchyItemLine
                  key={item.item.id.toString()}
                  item={item.item}
                />
              ))}
            </>
          </Section>
          <Section
            title="Téléchargements en cours"
            mb="S32"
            textProps={{color: 'white', bold: false}}>
            {!hasDownloading && (
              <Text color="grey">Aucun fichier en téléchargement</Text>
            )}
            {existingTorrents.map(torrent => (
              <TorrentRequestLine
                key={torrent.id.toString()}
                torrentRequest={torrent}
              />
            ))}
          </Section>
        </Box>
      </ScrollView>
      <SafeAreaView />
      <TorrentsActionSheet
        onClose={closeActionSheet}
        open={actionSheetOpen}
        torrents={torrents ?? []}
        onTorrentPress={downloadTorrent}
      />
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
