import {ScrollView, StyleSheet} from 'react-native';
import {useParams} from '../params';
import {useImageUri} from '../../services/tmdb';
import {Text} from '../../components/text/text';
import {Box} from '../../components/box/box';
import {useQuery} from '../../services/useQuery';
import {GetShowPageQuery} from '@media-center/server/src/queries/getShowPage.query';
import {FullScreenLoading} from '../../components/fullScreenLoading/fullScreenLoading';
import {PageBackground} from '../../components/pageBackground/pageBackground';
import {useQueryTorrents} from '../../services/useQueryTorrents';
import {BigPressable} from '../../components/bigPressable';
import {TorrentRequests} from '../../components/torrentRequests';
import {useCatalogEntryMoreOptions} from '../../services/useCatalogEntryMoreOptions';
import {SeasonSelector} from './seasonSelector';
import {useCallback, useState} from 'react';
import {ShowEpisodeCardsLine} from '../../components/showEpisodeCardsLine';
import {Beta} from '../../services/api';
import {handleBasicUserQuery} from '../../components/ui/promptAlert';
import {ShowEpisode} from '@media-center/server/src/domains/tmdb/domain/showEpisode';
import {SetUserTmdbInfoProgressCommand} from '@media-center/server/src/domains/userTmdbInfo/applicative/setUserTmdbInfoProgress.command';

export function Show() {
  const {show} = useParams<'Show'>();
  const imageUri = useImageUri(show.backdrop_path, true);
  const [focusedEpisode, setFocusedEpisode] = useState<ShowEpisode | undefined>(
    undefined,
  );

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

  const markViewed = useCallback(() => {
    if (!focusedEpisode) {
      return;
    }
    handleBasicUserQuery(
      Beta.command(
        new SetUserTmdbInfoProgressCommand({
          actorId: Beta.userId,
          tmdbId: show.id,
          season: focusedEpisode?.season_number,
          episode: focusedEpisode?.episode_number,
          progress: 1,
        }),
      ),
    );
  }, [focusedEpisode, show.id]);

  const markNotViewed = useCallback(() => {
    if (!focusedEpisode) {
      return;
    }
    handleBasicUserQuery(
      Beta.command(
        new SetUserTmdbInfoProgressCommand({
          actorId: Beta.userId,
          tmdbId: show.id,
          season: focusedEpisode?.season_number,
          episode: focusedEpisode?.episode_number,
          progress: 0,
        }),
      ),
    );
  }, [focusedEpisode, show.id]);

  if (!showPage) {
    return <FullScreenLoading />;
  }

  const hasSeasons = showPage.seasons.length > 0;
  const userLastSeen = showPage.userInfo.getLastWatchedInfo();
  const highlightedSeason =
    seasonIndex !== -1 ? seasonIndex : userLastSeen?.season ?? 1;
  const highlightedEpisode = userLastSeen?.episode ?? 0;
  const season = showPage.seasons.find(
    s => s.season_number === highlightedSeason,
  );
  const seasonEpisodes = showPage.episodes.find(
    e => e.season === highlightedSeason,
  )?.episodes;
  const availableEpisodes = showPage.catalogEntry
    .getEpisodesOfSeason(highlightedSeason)
    .map(e => e.episode);
  const focusedEpisodeFinished =
    (focusedEpisode &&
      showPage.userInfo.isEpisodeFinished(
        focusedEpisode.season_number,
        focusedEpisode.episode_number,
      )) ??
    false;

  return (
    <>
      <ScrollView style={styles.grow}>
        <PageBackground imageUri={imageUri} />
        <Box p="S32">
          <Box mb="S16">
            <Text bold size="big">
              {show.title.toUpperCase()}
            </Text>
            <Text color="textFaded">{show.getYear()}</Text>
          </Box>
          <Box
            row
            gap="S8"
            mb="S16"
            items="flex-end"
            content="space-between"
            style={styles.tabContainer}>
            <SeasonSelector
              seasons={showPage.seasons}
              season={highlightedSeason}
              onSeasonChange={setSeasonIndex}
            />
            <Box row w={330} mb="S4">
              <BigPressable
                text="Télécharger"
                focusOnMount={!hasSeasons}
                icon="download"
                onPress={queryTorrents}
                loading={queryTorrentsLoading}
              />
              {focusedEpisode ? (
                <BigPressable
                  text={
                    focusedEpisodeFinished
                      ? 'Marquer pas vu'
                      : 'Marquer comme vu'
                  }
                  icon={focusedEpisodeFinished ? 'eye-off' : 'eye'}
                  onPress={focusedEpisodeFinished ? markNotViewed : markViewed}
                />
              ) : null}
              <BigPressable
                text="Options"
                icon="dots-horizontal"
                onPress={openMoreOptions}
              />
            </Box>
          </Box>
          {season && seasonEpisodes ? (
            <ShowEpisodeCardsLine
              onFocusEpisode={setFocusedEpisode}
              focusIndex={highlightedEpisode}
              show={show}
              userInfo={showPage.userInfo}
              availableEpisodes={availableEpisodes}
              showEpisodes={seasonEpisodes}
              catalogEntry={showPage.catalogEntry}
              season={season.season_number}
            />
          ) : null}
          <Box w="60%" mt="S16">
            <Box mb="S4">
              <Text color="whiteText" bold size="default">
                Synopsis
              </Text>
            </Box>
            <Box mb="S16">
              <Text lineHeight={20} size="small" color="textFaded">
                {show.overview}
              </Text>
            </Box>
            <TorrentRequests requests={showPage.requests} />
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
  tabContainer: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'white',
  },
});
