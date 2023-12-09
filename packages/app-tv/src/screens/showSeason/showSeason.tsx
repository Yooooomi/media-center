import {SafeAreaView, StyleSheet, View} from 'react-native';
import {useParams} from '../params';
import Box from '../../components/box';
import LoggedImage from '../../components/loggedImage';
import {useImageUri} from '../../services/tmdb';
import Text from '../../components/text/text';
import ShowEpisodeCardsLine from '../../components/showEpisodeCardsLine/showEpisodeCardsLine';
import {useQuery} from '../../services/useQuery';
import {GetEpisodesQuery} from '@media-center/server/src/domains/tmdb/applicative/getEpisodes.query';
import {useState} from 'react';
import {ShowEpisode} from '@media-center/server/src/domains/tmdb/domain/showEpisode';
import FullScreenLoading from '../../components/fullScreenLoading/fullScreenLoading';

export default function ShowSeason() {
  const {show, season, catalogEntry} = useParams<'ShowSeason'>();
  const imageUri = useImageUri(show.backdrop_path);
  const [focusedEpisode, setFocusedEpisode] = useState<ShowEpisode | undefined>(
    undefined,
  );

  const [{result: showEpisodes}] = useQuery(GetEpisodesQuery, {
    tmdbId: show.id,
    seasonNumber: season.season_number,
  });

  if (!showEpisodes) {
    return <FullScreenLoading />;
  }

  const shownEpisodes = showEpisodes.filter(e =>
    catalogEntry.items.some(
      i => i.season === e.season_number && i.episode === e.episode_number,
    ),
  );

  return (
    <Box>
      <View style={styles.background}>
        <LoggedImage blurRadius={200} uri={imageUri} />
      </View>
      <Box p="S32" row content="space-between" items="flex-start" h={250}>
        <Box w="70%">
          <Box mb="S16" shrink>
            <Text color="whiteText" size="big">
              {show.title}
            </Text>
          </Box>
          <Text color="text" size="default" numberOfLines={3}>
            {focusedEpisode?.overview ?? show.overview}
          </Text>
          <Box row mv="S16" gap="S8">
            <Text color="text">{show.getYear().toString()}</Text>
            <Text color="text">{show.getRoundedNote()}</Text>
          </Box>
        </Box>
      </Box>
      <ShowEpisodeCardsLine
        focusFirst
        sectionProps={{ml: 'S32'}}
        onFocusEpisode={setFocusedEpisode}
        showSeason={season}
        showEpisodes={shownEpisodes}
        catalogEntry={catalogEntry}
      />
      <SafeAreaView />
    </Box>
  );
}

const styles = StyleSheet.create({
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  scrollview: {
    flexGrow: 1,
  },
});