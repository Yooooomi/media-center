import { ScrollView, StyleSheet, View } from "react-native";
import { GetMoviePageQuery } from "@media-center/domains/src/queries/getMoviePage.query";
import { useCallback } from "react";
import { SetUserTmdbInfoProgressCommand } from "@media-center/domains/src/userTmdbInfo/applicative/setUserTmdbInfoProgress.command";
import { color, rawColor } from "@media-center/ui/src/constants";
import { TmdbId } from "@media-center/domains/src/tmdb/domain/tmdbId";
import { IntentReturning } from "@media-center/domain-driven";
import { useImageUri } from "../../services/tmdb";
import { Text } from "../../components/ui/input/text/text";
import { Box } from "../../components/ui/display/box/box";
import { useQueryTorrents } from "../../services/hooks/useQueryTorrents";
import { BigPressable } from "../../components/ui/input/bigPressable/bigPressable";
import { WatchCatalogEntry } from "../../components/implementedUi/watchCatalogEntry";
import { FullScreenLoading } from "../../components/ui/display/fullScreenLoading/fullScreenLoading";
import { useCatalogEntryMoreOptions } from "../../services/hooks/useCatalogEntryMoreOptions";
import { RateLimitedImage } from "../../components/ui/display/rateLimitedImage";
import { ProgressOverlay } from "../../components/ui/display/progressOverlay";
import { TorrentRequests } from "../../components/implementedUi/torrentRequests";
import { TmdbNote } from "../../components/ui/display/tmdbNote";
import { handleBasicUserQuery } from "../../components/ui/tools/promptAlert";
import { Beta } from "../../services/api/api";
import { useQuery } from "../../services/api/useQuery";
import { HierarchyEntryInformationLine } from "../../components/implementedUi/hierarchyEntryInformationLine";
import { useParams } from "../navigation";
import { withDependencyWrapper } from "../../services/hocs/withDependencyWrapper";

export const Movie = withDependencyWrapper(
  MovieWrapped,
  () => {
    const { movieId } = useParams<"Movie">();
    const [{ result }, _, reload] = useQuery(
      GetMoviePageQuery,
      {
        actorId: Beta.userId,
        tmdbId: new TmdbId(movieId),
      },
      { reactive: true },
    );

    if (!result) {
      return undefined;
    }

    return { moviePage: result, reload };
  },
  {
    Fallback: FullScreenLoading,
  },
);

interface MovieWrappedProps {
  moviePage: IntentReturning<GetMoviePageQuery>;
  reload: () => void;
}

function MovieWrapped({ moviePage, reload }: MovieWrappedProps) {
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
      <Box grow row ph="S32" pv="S24" gap="S32">
        <RateLimitedImage
          uri={imageUri}
          style={StyleSheet.absoluteFillObject}
          blurRadius={50}
        />
        <View style={styles.blackOverlay} />
        <Box style={styles.background} r="small" overflow="hidden">
          <ProgressOverlay
            style={styles.coverContainer}
            progress={moviePage.userInfo.progress}
          >
            <RateLimitedImage
              resizeMode="cover"
              uri={imageUri}
              style={styles.grow}
            />
          </ProgressOverlay>
        </Box>
        <Box pv="S24" grow shrink content="space-between">
          <Box grow>
            <Box mb="S8" row content="space-between">
              <Text size="title" bold>
                {moviePage.tmdb.title}
              </Text>
              <Text size="title" color="textFaded">
                {moviePage.tmdb.getYear()}
              </Text>
            </Box>
            <Box mb="S24">
              <Box row content="space-between">
                <Text>
                  <TmdbNote note={moviePage.tmdb.getRoundedNote()} />・{" "}
                  {moviePage.details.getStringRuntime()} ・{" "}
                  {moviePage.details.genres[0]}
                </Text>
                {hasHierarchyItems ? (
                  <HierarchyEntryInformationLine
                    hierarchyEntryInformation={
                      moviePage.firstHierarchyInformation
                    }
                  />
                ) : null}
              </Box>
            </Box>
            <Text size="smaller" color="textFaded" lineHeight={20}>
              {moviePage.tmdb.overview}
            </Text>
            <ScrollView style={styles.torrentRequestsScrollview}>
              <Box mt="S16">
                <TorrentRequests requests={moviePage.requests} />
              </Box>
            </ScrollView>
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
  background: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.58,
    shadowRadius: 16.0,
    elevation: 12,
    width: "39%",
  },
  coverContainer: {
    flexGrow: 1,
    backgroundColor: color.background,
  },
  grow: {
    flexGrow: 1,
  },
  torrentRequestsScrollview: {
    flexBasis: 0,
    flexShrink: 1,
  },
});
