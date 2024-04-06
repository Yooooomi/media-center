import { SetUserTmdbInfoProgressCommand } from "@media-center/domains/src/userTmdbInfo/applicative/setUserTmdbInfoProgress.command";
import { rawColor } from "@media-center/ui/src/constants";
import { useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { Box } from "../../components/ui/display/box";
import { handleBasicUserQuery } from "../../components/ui/tools/promptAlert";
import { Beta } from "../../services/api/api";
import { useCatalogEntryMoreOptions } from "../../services/hooks/useCatalogEntryMoreOptions";
import { useQueryTorrents } from "../../services/hooks/useQueryTorrents";
import { useImageUri } from "../../services/tmdb";
import { WatchCatalogEntry } from "../../components/implementedUi/watchCatalogEntry";
import { ProgressOverlay } from "../../components/ui/display/progressOverlay";
import { RateLimitedImage } from "../../components/ui/display/rateLimitedImage";
import { TmdbNote } from "../../components/ui/display/tmdbNote";
import { BigPressable } from "../../components/ui/input/bigPressable";
import { Text } from "../../components/ui/input/text";
import { TorrentRequests } from "../../components/implementedUi/torrentRequests";
import { ScrollViewPadded } from "../../components/ui/display/scrollViewPadded";
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
      <Box grow>
        <RateLimitedImage
          uri={imageUri}
          style={StyleSheet.absoluteFillObject}
          blurRadius={170}
        />
        <View style={styles.blackOverlay} />
        <ScrollViewPadded style={styles.grow}>
          <Box overflow="hidden" row h={180} items="flex-start" mt="S8">
            <ProgressOverlay
              style={styles.coverContainer}
              progress={moviePage.userInfo.progress}
            >
              <RateLimitedImage
                resizeMode="contain"
                uri={imageUri}
                style={styles.grow}
              />
            </ProgressOverlay>
            <Box content="space-between" h="100%" p="S8">
              <Box gap="S4">
                <Text size="title" bold>
                  {moviePage.tmdb.title}
                </Text>
                <Text size="smaller" color="textFaded">
                  {moviePage.tmdb.getYear()}
                </Text>
              </Box>
              <Box content="space-between" gap="S2">
                <Text>
                  {moviePage.details.getStringRuntime()} ・{" "}
                  {moviePage.details.genres[0]}
                </Text>
                {moviePage.firstHierarchyInformation ? (
                  <Text>
                    {moviePage.firstHierarchyInformation.videoTrack.resolution.toDisplay()}{" "}
                    ・
                    {moviePage.firstHierarchyInformation.videoTrack.type
                      ? moviePage.firstHierarchyInformation.videoTrack.type
                      : ""}
                  </Text>
                ) : null}
                <Text>
                  <TmdbNote note={moviePage.tmdb.getRoundedNote()} />
                </Text>
              </Box>
            </Box>
          </Box>
          <Box grow content="space-between" p="S16">
            <Box grow>
              <Text size="smaller" color="textFaded" lineHeight={20}>
                {moviePage.tmdb.overview}
              </Text>
              <Box mt="S16">
                <TorrentRequests requests={moviePage.requests} />
              </Box>
            </Box>
            <Box w="100%" row gap="S16">
              {hasHierarchyItems && (
                <WatchCatalogEntry
                  entry={moviePage.catalogEntry}
                  requests={moviePage.requests}
                  userInfo={moviePage.userInfo}
                />
              )}
              <BigPressable
                text="Télécharger"
                focusOnMount={!hasHierarchyItems}
                icon="download"
                onPress={queryTorrents}
                loading={queryTorrentsLoading}
              />
              <BigPressable
                text={isFinished ? "Marquer pas vu" : "Marquer vu"}
                icon={isFinished ? "eye-off" : "eye"}
                onPress={isFinished ? markNotViewed : markViewed}
              />
              <BigPressable
                text="Options"
                icon="dots-horizontal"
                onPress={openMoreOptions}
              />
            </Box>
          </Box>
        </ScrollViewPadded>
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
