import { StyleSheet, View } from "react-native";
import { useState } from "react";
import { rawColor } from "@media-center/ui/src/constants";
import { useImageUri } from "../../services/tmdb";
import { Text } from "../../components/ui/input/text/text";
import { Box, ScrollViewPaddedBox } from "../../components/ui/display/box/box";
import { FullScreenLoading } from "../../components/ui/display/fullScreenLoading/fullScreenLoading";
import { useQueryTorrents } from "../../services/hooks/useQueryTorrents";
import { BigPressable } from "../../components/ui/input/bigPressable";
import { TorrentRequests } from "../../components/implementedUi/torrentRequests";
import { useCatalogEntryMoreOptions } from "../../services/hooks/useCatalogEntryMoreOptions";
import { RateLimitedImage } from "../../components/ui/display/rateLimitedImage";
import { TmdbNote } from "../../components/ui/display/tmdbNote";
import { ShowEpisodeCardsLine } from "../../components/implementedUi/showEpisodeCardsLine";
import { ShowWrappedProps } from "./showWrapped.props";
import { SeasonSelector } from "./seasonSelector";

export function ShowWrapped({ showPage, reload }: ShowWrappedProps) {
  const show = showPage.tmdb;
  const imageUri = useImageUri(show.poster_path, true);

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

  if (!showPage) {
    return <FullScreenLoading />;
  }

  const userLastSeen = showPage.userInfo.getLastWatchedInfo();
  const highlightedSeason =
    seasonIndex !== -1
      ? seasonIndex
      : userLastSeen?.season ??
        showPage.catalogEntry.getFirstAvailableSeason()?.season ??
        1;
  const highlightedEpisode = userLastSeen?.episode ?? 0;
  const season = showPage.seasons.find(
    (s) => s.season_number === highlightedSeason,
  );
  const seasonEpisodes = showPage.episodes.find(
    (e) => e.season === highlightedSeason,
  )?.episodes;

  return (
    <>
      <Box>
        <RateLimitedImage
          uri={imageUri}
          style={StyleSheet.absoluteFillObject}
          blurRadius={170}
        />
        <View style={styles.blackOverlay} />
        <ScrollViewPaddedBox grow mt="S8">
          <Box overflow="hidden" row h={180} items="flex-start">
            <View style={styles.coverContainer}>
              <RateLimitedImage
                resizeMode="contain"
                uri={imageUri}
                style={styles.grow}
              />
            </View>
            <Box content="space-between" h="100%" p="S8">
              <Box gap="S4">
                <Text size="title" bold>
                  {showPage.tmdb.title}
                </Text>
                <Text size="smaller" color="textFaded">
                  {showPage.tmdb.getYear()}
                </Text>
              </Box>
              <Box content="space-between" gap="S2">
                <Text>
                  <TmdbNote note={showPage.tmdb.getRoundedNote()} />
                </Text>
              </Box>
            </Box>
          </Box>
          <Box grow shrink content="space-between" p="S16">
            <Text size="smaller" color="textFaded" lineHeight={20}>
              {showPage.tmdb.overview}
            </Text>
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
              />
            ) : null}
            <Box mt="S16">
              <TorrentRequests requests={showPage.requests} />
            </Box>
            <Box w="100%" row gap="S16">
              <BigPressable
                text="Télécharger"
                icon="download"
                onPress={queryTorrents}
                loading={queryTorrentsLoading}
              />
              <BigPressable
                text="Options"
                icon="dots-horizontal"
                onPress={openMoreOptions}
              />
            </Box>
          </Box>
        </ScrollViewPaddedBox>
      </Box>
      {element}
      {MoreOptionsElement}
    </>
  );
}

const styles = StyleSheet.create({
  blackOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.4,
    backgroundColor: rawColor.black,
  },
  coverContainer: {
    width: "40%",
    height: "100%",
  },
  grow: {
    flexGrow: 1,
  },
  torrentRequestsScrollview: {
    flexBasis: 0,
    flexShrink: 1,
  },
});
