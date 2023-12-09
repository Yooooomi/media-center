import {ScrollView, StyleSheet, View} from 'react-native';
import {useParams} from '../params';
import {useImageUri} from '../../services/tmdb';
import Text from '../../components/text/text';
import {GetTorrentRequestsQuery} from '@media-center/server/src/domains/torrentRequest/applicative/getTorrentRequests.query';
import {GetSeasonsQuery} from '@media-center/server/src/domains/tmdb/applicative/getSeasons.query';
import {GetEntryQuery} from '@media-center/server/src/domains/catalog/applicative/getEntry.query';
import Box from '../../components/box/box';
import {useQuery} from '../../services/useQuery';
import {
  MovieCatalogEntryFulfilled,
  ShowCatalogEntryFulfilled,
} from '@media-center/server/src/domains/catalog/applicative/catalogEntryFulfilled.front';
import FullScreenLoading from '../../components/fullScreenLoading/fullScreenLoading';
import {PageBackground} from '../../components/pageBackground/pageBackground';
import {useQueryTorrents} from '../../services/useQueryTorrents';
import {BigInfo} from '../../components/bigInfo';
import {BigPressable} from '../../components/bigPressable';
import ShowSeasonCardsLine from '../../components/showSeasonCardsLine/showSeasonCardLine';
import {TorrentRequests} from '../../components/torrentRequests';

export function Show() {
  const {show} = useParams<'Show'>();
  const imageUri = useImageUri(show.backdrop_path, true);

  const [
    {result: existingTorrents},
    loadingExistingTorrents,
    reloadExistingTorrents,
  ] = useQuery(GetTorrentRequestsQuery, {
    tmdbId: show.id,
  });
  const [{result: existingEntry}, loadingExistingEntry, reloadExistingEntry] =
    useQuery(GetEntryQuery, {
      tmdbId: show.id,
    });
  const showExistingEntry = existingEntry as
    | ShowCatalogEntryFulfilled
    | undefined;
  const [{result: seasons}] = useQuery(GetSeasonsQuery, {tmdbId: show.id});

  const loadingItems = loadingExistingTorrents || loadingExistingEntry;

  const reload = () => {
    reloadExistingEntry();
    reloadExistingTorrents();
  };

  const {
    element,
    loading: queryTorrentsLoading,
    queryTorrents,
  } = useQueryTorrents({
    name: show.title,
    tmdbId: show.id,
    onDownloaded: reload,
  });

  const shownSeasons = seasons?.filter(s =>
    showExistingEntry?.items.some(e => e.season === s.season_number),
  );

  if (!shownSeasons || existingEntry instanceof MovieCatalogEntryFulfilled) {
    return <FullScreenLoading />;
  }

  return (
    <>
      <ScrollView style={styles.grow}>
        <PageBackground imageUri={imageUri} />
        <View style={styles.topRight}>
          <TorrentRequests requests={existingTorrents} />
        </View>
        <Box p="S32" style={styles.box}>
          <Text bold size="big">
            {show.title.toUpperCase()}
          </Text>
          <Box row gap="S8">
            <BigPressable
              icon="download"
              onPress={queryTorrents}
              loading={queryTorrentsLoading}
            />
            <BigPressable
              icon="refresh"
              onPress={reload}
              loading={loadingItems}
            />
            <BigInfo info={show.getYear()} />
          </Box>
          {existingEntry && (
            <ShowSeasonCardsLine
              focusFirst
              show={show}
              seasons={shownSeasons}
              catalogEntry={existingEntry}
            />
          )}
          <Box w="60%" mt="S16">
            <Box mb="S4">
              <Text color="whiteText" bold size="default">
                Synopsis
              </Text>
            </Box>
            <Box>
              <Text lineHeight={16} size="small">
                {show.overview}
              </Text>
            </Box>
          </Box>
        </Box>
      </ScrollView>
      {element}
    </>
  );
}

const styles = StyleSheet.create({
  grow: {
    flexGrow: 1,
  },
  scrollview: {
    flexGrow: 1,
  },
  box: {
    marginTop: 100,
  },
  topRight: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
});
