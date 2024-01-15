import {ScrollView, StyleSheet, View} from 'react-native';
import {useParams} from '../params';
import {useImageUri} from '../../services/tmdb';
import {Text} from '../../components/text/text';
import {Box} from '../../components/box/box';
import {GetMoviePageQuery} from '@media-center/server/src/queries/getMoviePage.query';
import {useQuery} from '../../services/useQuery';
import {useQueryTorrents} from '../../services/useQueryTorrents';
import {BigPressable} from '../../components/bigPressable/bigPressable';
import {rawColor} from '../../services/constants';
import {WatchCatalogEntry} from '../../components/watchCatalogEntry';
import {FullScreenLoading} from '../../components/fullScreenLoading/fullScreenLoading';
import {useCatalogEntryMoreOptions} from '../../services/useCatalogEntryMoreOptions';
import {Beta} from '../../services/api';
import {RateLimitedImage} from '../../components/rateLimitedImage';
import {ProgressOverlay} from '../../components/progressOverlay';
import {TorrentRequests} from '../../components/torrentRequests';

export function Movie() {
  const {movie} = useParams<'Movie'>();
  const imageUri = useImageUri(movie.backdrop_path, true);

  const [{result: moviePage}, _, reload] = useQuery(
    GetMoviePageQuery,
    {actorId: Beta.userId, tmdbId: movie.id},
    {reactive: true},
  );

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

  const {element: MoreOptionsElement, open: openMoreOptions} =
    useCatalogEntryMoreOptions({
      catalogEntry: moviePage?.catalogEntry,
      reload,
    });

  if (!moviePage) {
    return <FullScreenLoading />;
  }

  const hasHierarchyItems = moviePage.catalogEntry.items.length > 0;

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
            style={styles.grow}
            progress={moviePage.userInfo.progress}>
            <RateLimitedImage uri={imageUri} style={styles.grow} />
          </ProgressOverlay>
        </Box>
        <Box pv="S24" shrink content="space-between">
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
              <Box row gap="S32">
                <Text>
                  🍿 {moviePage.tmdb.getRoundedNote()}% ・{' '}
                  {moviePage.details.getStringRuntime()} ・{' '}
                  {moviePage.details.genres[0]}
                </Text>
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
          <Box w="100%" row gap="S16" debug>
            {hasHierarchyItems && (
              <WatchCatalogEntry
                name={moviePage.tmdb.title}
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
              text="Marqué vu"
              icon="eye"
              onPress={openMoreOptions}
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.58,
    shadowRadius: 16.0,
    elevation: 12,
    width: '33%',
  },
  grow: {
    flexGrow: 1,
  },
  torrentRequestsScrollview: {
    flexBasis: 0,
    flexShrink: 1,
  },
});
