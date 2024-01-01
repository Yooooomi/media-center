import {useCallback, useState} from 'react';
import Box from '../../components/box/box';
import {useAdditiveThrottle} from '../../services/useAdditiveThrottle';
import {Movie} from '@media-center/server/src/domains/tmdb/domain/movie';
import {SearchQuery} from '@media-center/server/src/domains/tmdb/applicative/search.query';
import {Show} from '@media-center/server/src/domains/tmdb/domain/show';
import {Beta} from '../../services/api';
import {FlatList, StyleSheet} from 'react-native';
import {MovieCard} from '../../components/implementedUi/cards/movieCard/movieCard';
import {ShowCard} from '../../components/implementedUi/cards/showCard/showCard';
import Section from '../../components/section/section';
import {useBooleanState} from '../../services/useBooleanState';
import {TextInput} from 'react-native';
import {spacing} from '../../services/constants';

export function SearchTmdb() {
  const [isFocused, focus, blur] = useBooleanState();
  const [results, setResults] = useState<(Movie | Show)[]>([]);

  const updateSearch = useCallback(async (text: string) => {
    const newResults = await Beta.query(new SearchQuery(text));
    setResults(newResults);
  }, []);
  const {add, value} = useAdditiveThrottle('', 500, v => updateSearch(v), true);

  const getItem = (item: Movie | Show, index: number) => {
    const isFirst = index === 0;
    if (item instanceof Movie) {
      return <MovieCard focusOnMount={!isFocused && isFirst} movie={item} />;
    } else if (item instanceof Show) {
      return <ShowCard focusOnMount={!isFocused && isFirst} show={item} />;
    }
    return null;
  };

  return (
    <Box mt="S8" ml="S8" grow>
      <TextInput
        style={styles.input}
        autoFocus
        onFocus={focus}
        onBlur={blur}
        numberOfLines={1}
        placeholder="Rechercher"
        value={value}
        onChangeText={newText => add(() => newText)}
      />
      <Section title="Résultats" mt="S24" grow>
        <FlatList
          style={styles.list}
          contentContainerStyle={styles.content}
          columnWrapperStyle={styles.column}
          numColumns={8}
          data={results}
          keyExtractor={r => r.id.toString()}
          renderItem={({item, index}) => getItem(item, index)}
        />
      </Section>
    </Box>
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  content: {
    gap: spacing.S8,
    padding: spacing.S8,
  },
  column: {
    gap: spacing.S8,
  },
  input: {
    width: 300,
  },
});
