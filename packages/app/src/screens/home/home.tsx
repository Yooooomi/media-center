import {FlatList, SafeAreaView, StyleSheet} from 'react-native';
import Box from '../../components/box';
import MovieCard from '../../components/movieCard';
import Section from '../../components/section';
import ShowCard from '../../components/showCard';
import {spacing} from '../../services/constants';
import {Movie} from '@media-center/server/src/domains/tmdb/domain/movie';
import {Show} from '@media-center/server/src/domains/tmdb/domain/show';
import {DiscoverMovieQuery} from '@media-center/server/src/domains/tmdb/applicative/discoverMovie.query';
import {DiscoverShowQuery} from '@media-center/server/src/domains/tmdb/applicative/discoverShow.query';
import {useState, useEffect} from 'react';
import {Beta} from '../../services/api';

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [shows, setShows] = useState<Show[]>([]);

  useEffect(() => {
    async function init() {
      const data = await Beta.query(new DiscoverMovieQuery());
      const dataS = await Beta.query(new DiscoverShowQuery());
      setMovies(data);
      setShows(dataS);
    }
    init().catch(e => {
      console.log('FAILED');
      console.log('failed', e.message);
    });
  }, []);

  return (
    <SafeAreaView style={styles.root}>
      <Box>
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
        <Section title="Découvrir des séries" mb="S24" titleBox={{ml: 'S8'}}>
          <FlatList
            horizontal
            data={shows}
            renderItem={({item}) => (
              <Box mr="S8">
                <ShowCard show={item} />
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
