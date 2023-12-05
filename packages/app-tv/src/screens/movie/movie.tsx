import {StyleSheet, View} from 'react-native';
import {useNavigate, useParams} from '../params';
import {useImageUri} from '../../services/tmdb';
import Text from '../../components/text/text';
import {GetEntryQuery} from '@media-center/server/src/domains/catalog/applicative/getEntry.query';
import Box from '../../components/box/box';
import {GetTorrentRequestsQuery} from '@media-center/server/src/domains/torrentRequest/applicative/getTorrentRequests.query';
import {GetMovieDetailsQuery} from '@media-center/server/src/domains/tmdb/applicative/getMovieDetails.query';
import {useQuery} from '../../services/useQuery';
import {PageBackground} from '../../components/pageBackground/pageBackground';
import {useQueryTorrents} from '../../services/useQueryTorrents';
import {BigInfo} from '../../components/bigInfo';
import {BigPressable} from '../../components/bigPressable/bigPressable';
import {ReactNode} from 'react';
import {spacing} from '../../services/constants';

export default function Movie() {
  const navigate = useNavigate();
  const {movie} = useParams<'Movie'>();
  const imageUri = useImageUri(movie.backdrop_path, true);

  const [{result: details}] = useQuery(GetMovieDetailsQuery, {
    tmdbId: movie.id,
  });
  const [
    {result: existingTorrents},
    loadingExistingTorrents,
    reloadExistingTorrents,
  ] = useQuery(GetTorrentRequestsQuery, {
    tmdbId: movie.id,
  });
  const [{result: existingEntry}, loadingExistingEntry, reloadExistingEntry] =
    useQuery(GetEntryQuery, {
      tmdbId: movie.id,
    });

  const firstRequest = existingTorrents?.[0];
  const latestItem = existingEntry?.getLatestItem();
  const loadingItems = loadingExistingTorrents || loadingExistingEntry;

  const watch = () => {
    if (!latestItem) {
      return;
    }
    navigate('Watch', {
      hierarchyItem: latestItem.item,
    });
  };

  const reload = () => {
    reloadExistingEntry();
    reloadExistingTorrents();
  };

  const {
    element,
    loading: queryTorrentsLoading,
    queryTorrents,
  } = useQueryTorrents({
    name: movie.title,
    tmdbId: movie.id,
    onDownloaded: reload,
  });

  let children: ReactNode | undefined;
  if (!latestItem && firstRequest) {
    children = <Text size="big">{firstRequest.getPercentage()}%</Text>;
  }

  return (
    <>
      <View style={styles.grow}>
        <PageBackground imageUri={imageUri} />
        <Box p="S32" style={{marginTop: 100}}>
          <Box row gap="S8" style={{marginBottom: -spacing.S4}}>
            {details?.genres.map(genre => (
              <Text key={genre} size="smaller">
                {genre}
              </Text>
            ))}
          </Box>
          <Text bold size="big">
            {movie.title.toUpperCase()}
          </Text>
          <Box row gap="S8">
            <BigPressable
              hasTVPreferredFocus
              bg="ctaGreen"
              icon="play"
              onPress={watch}>
              {children}
            </BigPressable>
            <BigPressable
              bg={['buttonLightBackground', 0.4]}
              icon="download"
              onPress={queryTorrents}
              loading={queryTorrentsLoading}
            />
            <BigPressable
              bg={['buttonLightBackground', 0.4]}
              icon="refresh"
              onPress={reload}
              loading={loadingItems}
            />

            <BigInfo info={details?.getStringRuntime()} />
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
    </>
  );
}

const styles = StyleSheet.create({
  grow: {
    flexGrow: 1,
  },
});
