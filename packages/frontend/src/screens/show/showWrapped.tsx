import { StyleSheet, View } from "react-native";
import { useCallback, useState } from "react";
import { ShowEpisode } from "@media-center/domains/src/tmdb/domain/showEpisode";
import { SetUserTmdbInfoProgressCommand } from "@media-center/domains/src/userTmdbInfo/applicative/setUserTmdbInfoProgress.command";
import { color, shadows } from "@media-center/ui/src/constants";
import { noop } from "@media-center/algorithm";
import { useImageUri } from "../../services/tmdb";
import { Text } from "../../components/ui/input/text/text";
import { Box } from "../../components/ui/display/box/box";
import { FullScreenLoading } from "../../components/ui/display/fullScreenLoading/fullScreenLoading";
import { useQueryTorrents } from "../../services/hooks/useQueryTorrents";
import { BigPressable } from "../../components/ui/input/bigPressable";
import { TorrentRequests } from "../../components/implementedUi/torrentRequests";
import { useCatalogEntryMoreOptions } from "../../services/hooks/useCatalogEntryMoreOptions";
import { ShowEpisodeCardsLine } from "../../components/implementedUi/showEpisodeCardsLine";
import { handleBasicUserQuery } from "../../components/ui/tools/promptAlert";
import { Beta } from "../../services/api/api";
import { RateLimitedImage } from "../../components/ui/display/rateLimitedImage";
import { cardRatio } from "../../services/cards";
import { Stars } from "../../components/ui/display/stars";
import { SeasonSelector } from "./seasonSelector";
import { ShowWrappedProps } from "./showWrapped.props";

export function ShowWrapped({ showPage, reload }: ShowWrappedProps) {
  const show = showPage.tmdb;
  const imageUri = useImageUri(show.poster_path, true);
  const [focusedEpisode, setFocusedEpisode] = useState<ShowEpisode | undefined>(
    undefined,
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

  const { element: MoreOptionsElement, open: openMoreOptions } =
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
    seasonIndex !== -1
      ? seasonIndex
      : userLastSeen?.season ??
        showPage.catalogEntry.getFirstAvailableSeason()?.season ??
        1;
  const highlightedEpisode = userLastSeen?.episode ?? 0;
  const season = showPage.seasons.find(
    (showPageSeason) => showPageSeason.season_number === highlightedSeason,
  );
  const seasonEpisodes = showPage.episodes.find(
    (e) => e.season === highlightedSeason,
  )?.episodes;
  const focusedEpisodeFinished =
    (focusedEpisode &&
      showPage.userInfo.isEpisodeFinished(
        focusedEpisode.season_number,
        focusedEpisode.episode_number,
      )) ??
    false;

  const focusedEpisodeHierarchyInformation = focusedEpisode
    ? showPage.hierarchyEntryInformation.find(
        (e) =>
          e.season === focusedEpisode.season_number &&
          e.episode === focusedEpisode.episode_number,
      )?.information
    : undefined;
  const focusedEpisodeHasHierarchyEntry = focusedEpisode
    ? showPage.catalogEntry.getEpisode(
        focusedEpisode.season_number,
        focusedEpisode.episode_number,
      ).length !== 0
    : null;

  return (
    <>
      <View style={styles.background} />
      <Box p="S32">
        <Box row gap="S32" style={styles.header} items="flex-start">
          <Box r="default" style={shadows.light} overflow="hidden">
            <RateLimitedImage style={styles.cover} uri={imageUri} />
          </Box>
          <Box shrink pv="S8">
            <Text size="big" bold>
              {show.title}
            </Text>
            <Box gap="S24" mt="S16">
              <Box gap="S4">
                <Text size="smaller" color="textFaded" bolder>
                  {show.getYear()}
                </Text>
                <Stars note={show.getNoteOutOf(5)} outOf={5} size={16} />
              </Box>
              <Box row gap="S8">
                <BigPressable
                  icon="play"
                  onPress={noop}
                  text=""
                  bg="ctaGreen"
                />
                <BigPressable
                  icon="download"
                  loading={queryTorrentsLoading}
                  loadingColor="whiteText"
                  onPress={queryTorrents}
                  text=""
                />
                <BigPressable
                  icon="dots-horizontal"
                  onPress={openMoreOptions}
                  text=""
                />
              </Box>
              <Box>
                <Text size="smaller" color="whiteText" bolder>
                  {show.overview}
                </Text>
              </Box>
            </Box>
          </Box>
        </Box>
        <Box mt="S32" gap="S8" overflow="visible">
          <SeasonSelector
            seasons={showPage.seasons}
            season={highlightedSeason}
            onSeasonChange={setSeasonIndex}
          />
          {season && seasonEpisodes ? (
            <ShowEpisodeCardsLine
              focusIndex={highlightedEpisode}
              userInfo={showPage.userInfo}
              showEpisodes={seasonEpisodes}
              catalogEntry={showPage.catalogEntry}
              season={season.season_number}
              onFocusEpisode={setFocusedEpisode}
            />
          ) : null}
        </Box>
        <Box>
          <TorrentRequests requests={showPage.requests} />
        </Box>
      </Box>
      {element}
      {MoreOptionsElement}
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingRight: 300,
  },
  cover: {
    width: 230,
    aspectRatio: cardRatio,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    color: color.background,
  },
});
