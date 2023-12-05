import {ScrollView, StyleSheet} from 'react-native';
import {useNavigate, useParams} from '../params';
import {useImageUri} from '../../services/tmdb';
import Text from '../../components/text/text';
import {GetTorrentRequestsQuery} from '@media-center/server/src/domains/torrentRequest/applicative/getTorrentRequests.query';
import {GetSeasonsQuery} from '@media-center/server/src/domains/tmdb/applicative/getSeasons.query';
import {GetEntryQuery} from '@media-center/server/src/domains/catalog/applicative/getEntry.query';
import Box from '../../components/box/box';
import {useQuery} from '../../services/useQuery';
import {
  MovieCatalogEntryFulfilled,
  ShowCatalogEntryFulfilled,
} from '@media-center/server/src/domains/catalog/applicative/catalogEntryFulfilled.front';
import FullScreenLoading from '../../components/fullScreenLoading/fullScreenLoading';
import {PageBackground} from '../../components/pageBackground/pageBackground';
import {useQueryTorrents} from '../../services/useQueryTorrents';
import {BigInfo} from '../../components/bigInfo';
import {BigPressable} from '../../components/bigPressable';
import ShowSeasonCardsLine from '../../components/showSeasonCardsLine/showSeasonCardLine';

export default function Show() {
  const navigate = useNavigate();
  const {show} = useParams<'Show'>();
  const imageUri = useImageUri(show.backdrop_path, true);

  const [
    {result: existingTorrents},
    loadingExistingTorrents,
    reloadExistingTorrents,
  ] = useQuery(GetTorrentRequestsQuery, {
    tmdbId: show.id,
  });
  const [{result: existingEntry}, loadingExistingEntry, reloadExistingEntry] =
    useQuery(GetEntryQuery, {
      tmdbId: show.id,
    });
  const showExistingEntry = existingEntry as
    | ShowCatalogEntryFulfilled
    | undefined;
  const [{result: seasons}] = useQuery(GetSeasonsQuery, {tmdbId: show.id});

  const hasDownloading = existingTorrents && existingTorrents.length > 0;
  const loadingItems = loadingExistingTorrents || loadingExistingEntry;

  const reload = () => {
    reloadExistingEntry();
    reloadExistingTorrents();
  };

  const {
    element,
    loading: queryTorrentsLoading,
    queryTorrents,
  } = useQueryTorrents({
    name: show.title,
    tmdbId: show.id,
    onDownloaded: reload,
  });

  const shownSeasons = seasons?.filter(s =>
    showExistingEntry?.items.some(e => e.season === s.season_number),
  );

  if (!shownSeasons || existingEntry instanceof MovieCatalogEntryFulfilled) {
    return <FullScreenLoading />;
  }

  return (
    <>
      <ScrollView style={styles.grow}>
        <PageBackground imageUri={imageUri} />
        <Box p="S32" style={styles.box}>
          <Text bold size="big">
            {show.title.toUpperCase()}
          </Text>
          <Box row gap="S8">
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

            <BigInfo info={show.getYear()} />
          </Box>
          {existingEntry && (
            <ShowSeasonCardsLine
              focusFirst
              show={show}
              seasons={shownSeasons}
              catalogEntry={existingEntry}
            />
          )}
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
    </>
  );

  // return (
  //   <>
  //     <ScrollView
  //       style={styles.scrollview}
  //       contentContainerStyle={styles.scrollview}>
  //       <PageBackground imageUri={imageUri} />
  //       <Box p="S32" row content="space-between" items="flex-end">
  //         <Box w="70%">
  //           <Box mb="S16">
  //             <Text color="white" size="big">
  //               {show.title}
  //             </Text>
  //           </Box>
  //           <Text color="lightgrey" size="default">
  //             {show.overview}
  //           </Text>
  //           <Box row mv="S16" gap="S8">
  //             <Text color="lightgrey">{show.getYear().toString()}</Text>
  //             <Text color="lightgrey">{show.getRoundedNote()}</Text>
  //           </Box>
  //         </Box>
  //       </Box>
  //       {!existingEntry && (
  //         <Box ml="S32">
  //           <Text color="grey">Aucun fichier téléchargé</Text>
  //         </Box>
  //       )}
  //       {existingEntry && (
  //         <ShowSeasonCardsLine
  //           focusFirst
  //           sectionProps={{ml: 'S32'}}
  //           show={show}
  //           seasons={shownSeasons}
  //           catalogEntry={existingEntry}
  //         />
  //       )}
  //       <Section title="Téléchargements en cours" mv="S32" mh="S32">
  //         {!hasDownloading && (
  //           <Text color="grey">Aucun fichier en téléchargement</Text>
  //         )}
  //         {existingTorrents?.map(torrent => (
  //           <TorrentRequestLine
  //             key={torrent.id.toString()}
  //             torrentRequest={torrent}
  //           />
  //         ))}
  //       </Section>
  //     </ScrollView>
  //     <SafeAreaView />
  //     {element}
  //   </>
  // );
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
});
