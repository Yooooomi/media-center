import {Fragment, useCallback, useMemo, useState} from 'react';
import Box from '../../components/box/box';
import TextInput from '../../components/textInput/textInput';
import {useAdditiveThrottle} from '../../services/useAdditiveThrottle';
import {Movie} from '@media-center/server/src/domains/tmdb/domain/movie';
import {SearchQuery} from '@media-center/server/src/domains/tmdb/applicative/search.query';
import {Show} from '@media-center/server/src/domains/tmdb/domain/show';
import {Beta} from '../../services/api';
import {ScrollView, View} from 'react-native';
import {MovieCard} from '../../components/implementedUi/cards/movieCard/movieCard';
import {ShowCard} from '../../components/implementedUi/cards/showCard/showCard';
import {chunk} from '@media-center/algorithm';
import Section from '../../components/section/section';
import {useBooleanState} from '../../services/useBooleanState';

export default function Search() {
  const [isFocused, focus, blur] = useBooleanState();
  const [results, setResults] = useState<(Movie | Show)[]>([]);

  const updateSearch = useCallback(async (text: string) => {
    const newResults = await Beta.query(
      new SearchQuery({
        search: text,
      }),
    );
    setResults(newResults);
  }, []);
  const {add, value} = useAdditiveThrottle('', 500, v => updateSearch(v), true);

  const chunks = useMemo(() => chunk(results, 6), [results]);

  const getItem = (item: Movie | Show, lineIndex: number, index: number) => {
    const isFirst = lineIndex === 0 && index === 0;
    if (item instanceof Movie) {
      return <MovieCard focusOnMount={!isFocused && isFirst} movie={item} />;
    } else if (item instanceof Show) {
      return <ShowCard focusOnMount={!isFocused && isFirst} show={item} />;
    }
    return null;
  };

  return (
    <ScrollView>
      <Box mt="S8" ml="S8">
        <TextInput
          autoFocus
          onFocus={focus}
          onBlur={blur}
          numberOfLines={1}
          placeholder="Rechercher"
          value={value}
          onChangeText={newText => add(() => newText)}
        />
        <Section title="Résultats" mt="S24">
          {chunks.map((chk, lineIndex) => (
            <View key={chk.map(c => c.id.toString()).join(',')}>
              <Box gap="S8" mb="S8" row>
                {chk.map((i, index) => (
                  <Fragment key={i.id.toString()}>
                    {getItem(i, lineIndex, index)}
                  </Fragment>
                ))}
              </Box>
            </View>
          ))}
        </Section>
      </Box>
    </ScrollView>
  );
}
