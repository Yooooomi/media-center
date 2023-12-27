import {ScrollView, StyleSheet, View} from 'react-native';
import {useParams} from '../params';
import {useImageUri} from '../../services/tmdb';
import Text from '../../components/text/text';
import Box from '../../components/box/box';
import {useQuery} from '../../services/useQuery';
import {GetShowPageQuery} from '@media-center/server/src/queries/getShowPage.query';
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

  const [{result: showPage}, fetching, reload] = useQuery(
    GetShowPageQuery,
    show.id,
  );

  const {
    element,
    loading: queryTorrentsLoading,
    queryTorrents,
  } = useQueryTorrents({
    name: show.title,
    tmdbId: show.id,
    onDownloaded: reload,
  });

  const shownSeasons =
    showPage?.seasons.filter(season =>
      showPage.catalogEntry.items.some(i => i.season === season.season_number),
    ) ?? [];

  if (!showPage) {
    return <FullScreenLoading />;
  }

  return (
    <>
      <ScrollView style={styles.grow}>
        <PageBackground imageUri={imageUri} />
        <View style={styles.topRight}>
          <TorrentRequests requests={showPage.requests} />
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
            <BigPressable icon="refresh" onPress={reload} loading={fetching} />
            <BigInfo info={show.getYear()} />
          </Box>
          <ShowSeasonCardsLine
            focusFirst
            show={show}
            seasons={shownSeasons}
            catalogEntry={showPage.catalogEntry}
          />
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
