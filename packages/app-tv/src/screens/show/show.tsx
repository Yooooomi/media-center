import {ScrollView, StyleSheet, View} from 'react-native';
import {useParams} from '../params';
import {useImageUri} from '../../services/tmdb';
import {Text} from '../../components/text/text';
import {Box} from '../../components/box/box';
import {useQuery} from '../../services/useQuery';
import {GetShowPageQuery} from '@media-center/server/src/queries/getShowPage.query';
import {FullScreenLoading} from '../../components/fullScreenLoading/fullScreenLoading';
import {PageBackground} from '../../components/pageBackground/pageBackground';
import {useQueryTorrents} from '../../services/useQueryTorrents';
import {BigInfo} from '../../components/bigInfo';
import {BigPressable} from '../../components/bigPressable';
import {TorrentRequests} from '../../components/torrentRequests';
import {spacing} from '../../services/constants';
import {useCatalogEntryMoreOptions} from '../../services/useCatalogEntryMoreOptions';
import {SeasonSelector} from './seasonSelector';
import {useState} from 'react';
import {ShowEpisodeCardsLine} from '../../components/showEpisodeCardsLine';
import {Beta} from '../../services/api';

export function Show() {
  const {show} = useParams<'Show'>();
  const imageUri = useImageUri(show.backdrop_path, true);

  const [{result: showPage}, _, reload] = useQuery(
    GetShowPageQuery,
    {actorId: Beta.userId, tmdbId: show.id},
    {
      reactive: true,
    },
  );

  const {
    element,
    loading: queryTorrentsLoading,
    queryTorrents,
  } = useQueryTorrents({
    names: [show.title, show.original_title],
    tmdbId: show.id,
  });

  const [seasonIndex, setSeasonIndex] = useState(-1);

  const {element: MoreOptionsElement, open: openMoreOptions} =
    useCatalogEntryMoreOptions({
      catalogEntry: showPage?.catalogEntry,
      reload,
    });

  if (!showPage) {
    return <FullScreenLoading />;
  }

  const hasSeasons = showPage.seasons.length > 0;
  const highlightedSeason =
    seasonIndex !== -1
      ? seasonIndex
      : showPage.userInfo.getLastSeasonBegan() ?? 1;
  const season = showPage.seasons.find(
    s => s.season_number === highlightedSeason,
  );
  const seasonEpisodes = showPage.episodes.find(
    e => e.season === highlightedSeason,
  )?.episodes;
  const availableEpisodes = showPage.catalogEntry
    .getEpisodesOfSeason(highlightedSeason)
    .map(e => e.episode);

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
          <Box row gap="S8" mb="S8">
            <BigPressable
              focusOnMount={!hasSeasons}
              icon="download"
              onPress={queryTorrents}
              loading={queryTorrentsLoading}
            />
            <BigPressable icon="dots-horizontal" onPress={openMoreOptions} />
            <BigInfo info={show.getYear()} />
          </Box>
          <SeasonSelector
            seasons={showPage.seasons}
            season={highlightedSeason}
            onSeasonChange={setSeasonIndex}
          />
          {season && seasonEpisodes ? (
            <ShowEpisodeCardsLine
              focusFirst
              show={show}
              userInfo={showPage.userInfo}
              availableEpisodes={availableEpisodes}
              showEpisodes={seasonEpisodes}
              catalogEntry={showPage.catalogEntry}
            />
          ) : null}
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
      {MoreOptionsElement}
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
    top: spacing.S16,
    right: spacing.S16,
  },
});
