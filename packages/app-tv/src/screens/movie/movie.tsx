import {StyleSheet, View} from 'react-native';
import {useParams} from '../params';
import {useImageUri} from '../../services/tmdb';
import Text from '../../components/text/text';
import Box from '../../components/box/box';
import {GetMoviePageQuery} from '@media-center/server/src/queries/getMoviePage.query';
import {useQuery} from '../../services/useQuery';
import {PageBackground} from '../../components/pageBackground/pageBackground';
import {useQueryTorrents} from '../../services/useQueryTorrents';
import {BigInfo} from '../../components/bigInfo';
import {BigPressable} from '../../components/bigPressable/bigPressable';
import {spacing} from '../../services/constants';
import {WatchCatalogEntry} from '../../components/watchCatalogEntry';
import {TorrentRequests} from '../../components/torrentRequests';
import FullScreenLoading from '../../components/fullScreenLoading/fullScreenLoading';
import {useCatalogEntryMoreOptions} from '../../services/useCatalogEntryMoreOptions';

export function Movie() {
  const {movie} = useParams<'Movie'>();
  const imageUri = useImageUri(movie.backdrop_path, true);

  const [{result: moviePage}, _, reload] = useQuery(
    GetMoviePageQuery,
    movie.id,
    {reactive: true},
  );

  const {
    element,
    loading: queryTorrentsLoading,
    queryTorrents,
  } = useQueryTorrents({
    name: `${movie.title} ${movie.getYear()}`,
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

  return (
    <>
      <View style={styles.grow}>
        <PageBackground imageUri={imageUri} />
        <View style={styles.topRight}>
          <TorrentRequests requests={moviePage.requests} />
        </View>
        <Box p="S32" style={styles.box}>
          <Box row gap="S8" style={{marginBottom: -spacing.S4}}>
            {moviePage.details.genres.map(genre => (
              <Text key={genre} size="smaller">
                {genre}
              </Text>
            ))}
          </Box>
          <Text bold size="big">
            {movie.title.toUpperCase()}
          </Text>
          <Box row gap="S8">
            {moviePage.catalogEntry.items.length > 0 && (
              <WatchCatalogEntry
                entry={moviePage.catalogEntry}
                requests={moviePage.requests}
              />
            )}
            <BigPressable
              icon="download"
              onPress={queryTorrents}
              loading={queryTorrentsLoading}
            />
            <BigPressable icon="dots-horizontal" onPress={openMoreOptions} />
            <BigInfo info={moviePage.details?.getStringRuntime()} />
            <BigInfo info={movie.getYear()} />
          </Box>
          <Box w="60%" mt="S16">
            <Box mb="S4">
              <Text color="text" bold size="default">
                Synopsis
              </Text>
            </Box>
            <Box>
              <Text lineHeight={16} size="small">
                {movie.overview}
              </Text>
            </Box>
          </Box>
        </Box>
      </View>
      {element}
      {MoreOptionsElement}
    </>
  );
}

const styles = StyleSheet.create({
  box: {
    marginTop: 100,
  },
  grow: {
    flexGrow: 1,
  },
  topRight: {
    position: 'absolute',
    top: spacing.S16,
    right: spacing.S16,
  },
});
