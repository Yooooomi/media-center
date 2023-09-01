import {
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Box from '../../components/box';
import MovieCard from '../../components/movieCard';
import Section from '../../components/section';
import ShowCard from '../../components/showCard';
import {spacing} from '../../services/constants';
import {Movie} from '@media-center/server/src/domains/tmdb/domain/movie';
import {Show} from '@media-center/server/src/domains/tmdb/domain/show';
import {useState, useEffect} from 'react';
import {api} from '../../services/api';

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [shows, setShows] = useState<Show[]>([]);

  useEffect(() => {
    async function init() {
      const data = await api.discoverMovie({});
      const dataS = await api.discoverShow({});
      setMovies(data);
      setShows(dataS);
    }
    init().catch(e => {
      console.log('failed', e);
    });
  }, []);

  return (
    <SafeAreaView style={styles.root}>
      <Box>
        <Section title="Découvrir des séries" mb="S24" titleBox={{ml: 'S8'}}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{overflow: 'visible'}}>
            <Box row gap="S8" ph="S8">
              {shows.map(show => (
                <ShowCard key={show.id.toString()} show={show} />
              ))}
            </Box>
          </ScrollView>
        </Section>
        <Section title="Découvrir des films" mb="S16" titleBox={{ml: 'S8'}}>
          <FlatList
            horizontal
            data={movies}
            renderItem={({item}) => (
              <Box mr="S8">
                <MovieCard movie={item} />
              </Box>
            )}
            keyExtractor={movie => movie.id.toString()}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{padding: spacing.S8}}
          />
        </Section>
      </Box>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flexGrow: 1,
    gap: spacing.S16,
    flexDirection: 'row',
  },
});
