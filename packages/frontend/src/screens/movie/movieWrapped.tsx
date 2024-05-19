import { SetUserTmdbInfoProgressCommand } from "@media-center/domains/src/userTmdbInfo/applicative/setUserTmdbInfoProgress.command";
import { color, shadows } from "@media-center/ui/src/constants";
import { useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { Box } from "../../components/ui/display/box";
import { handleBasicUserQuery } from "../../components/ui/tools/promptAlert";
import { Beta } from "../../services/api/api";
import { useCatalogEntryMoreOptions } from "../../services/hooks/useCatalogEntryMoreOptions";
import { useQueryTorrents } from "../../services/hooks/useQueryTorrents";
import { useImageUri } from "../../services/tmdb";
import { RateLimitedImage } from "../../components/ui/display/rateLimitedImage";
import { BigPressable } from "../../components/ui/input/bigPressable";
import { Text } from "../../components/ui/input/text";
import { TorrentRequests } from "../../components/implementedUi/torrentRequests";
import { cardRatio } from "../../services/cards";
import { Stars } from "../../components/ui/display/stars";
import { Tooltip } from "../../components/ui/display/tooltip";
import { WatchCatalogEntry } from "../../components/implementedUi/watchCatalogEntry";
import { MovieWrappedProps } from "./movieWrapped.props";

export function MovieWrapped({ moviePage, reload }: MovieWrappedProps) {
  const movie = moviePage.tmdb;
  const imageUri = useImageUri(movie.poster_path, true);

  const {
    element,
    loading: queryTorrentsLoading,
    queryTorrents,
  } = useQueryTorrents({
    names: [
      `${movie.title} ${movie.getYear()}`,
      `${movie.original_title} ${movie.getYear()}`,
    ],
    tmdbId: movie.id,
  });

  const { element: MoreOptionsElement, open: openMoreOptions } =
    useCatalogEntryMoreOptions({
      catalogEntry: moviePage?.catalogEntry,
      reload,
    });

  const markViewed = useCallback(async () => {
    handleBasicUserQuery(
      Beta.command(
        new SetUserTmdbInfoProgressCommand({
          actorId: Beta.userId,
          tmdbId: movie.id,
          progress: 1,
        }),
      ),
    );
  }, [movie.id]);

  const markNotViewed = useCallback(async () => {
    handleBasicUserQuery(
      Beta.command(
        new SetUserTmdbInfoProgressCommand({
          actorId: Beta.userId,
          tmdbId: movie.id,
          progress: 0,
        }),
      ),
    );
  }, [movie.id]);

  const hasHierarchyItems = moviePage.catalogEntry.hasHierarchyItems();
  const isFinished = moviePage.userInfo.isFinished();

  return (
    <>
      <View style={styles.background} />
      <Box p="S32">
        <Box row gap="S32" style={styles.header}>
          <Box r="default" style={shadows.light} overflow="hidden">
            <RateLimitedImage style={styles.cover} uri={imageUri} />
          </Box>
          <Box shrink pv="S8">
            <Text size="big" bold>
              {movie.title}
            </Text>
            <Box gap="S24" mt="S16" shrink>
              <Box gap="S4">
                <Text size="smaller" color="textFaded" bolder>
                  {movie.getYear()}
                </Text>
                <Stars note={movie.getNoteOutOf(5)} outOf={5} size={16} />
                {moviePage.firstHierarchyInformation ? (
                  <Tooltip
                    tooltip={moviePage.firstHierarchyInformation?.textTracks.map(
                      (e) => (
                        <View key={e.name}>
                          <Text color="darkText">{e.name}</Text>
                        </View>
                      ),
                    )}
                  >
                    <Text size="smaller" color="textFaded">
                      {moviePage.firstHierarchyInformation?.videoTrack.type} -{" "}
                      {moviePage.firstHierarchyInformation?.textTracks.length}{" "}
                      Sous-titres
                    </Text>
                  </Tooltip>
                ) : null}
              </Box>
              <Box row gap="S8">
                {hasHierarchyItems ? (
                  <WatchCatalogEntry
                    entry={moviePage.catalogEntry}
                    requests={moviePage.requests}
                    userInfo={moviePage.userInfo}
                  />
                ) : null}
                <BigPressable
                  icon="download"
                  loading={queryTorrentsLoading}
                  loadingColor="whiteText"
                  onPress={queryTorrents}
                  text=""
                />
                <BigPressable
                  icon={isFinished ? "eye" : "eye-off"}
                  onPress={isFinished ? markNotViewed : markViewed}
                  text=""
                  tooltip={isFinished ? "Mark as not viewed" : "Mark as viewed"}
                />
                <BigPressable
                  icon="dots-horizontal"
                  onPress={openMoreOptions}
                  text=""
                />
              </Box>
              <Box shrink>
                <Text size="smaller" color="whiteText" bolder numberOfLines={6}>
                  {movie.overview}
                </Text>
              </Box>
            </Box>
          </Box>
        </Box>
        <Box>
          <TorrentRequests requests={moviePage.requests} />
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
    height: 230 / cardRatio,
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
