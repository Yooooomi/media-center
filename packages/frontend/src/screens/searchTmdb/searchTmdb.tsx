import { useCallback, useState } from "react";
import { Movie } from "@media-center/domains/src/tmdb/domain/movie";
import { SearchTmdbQuery } from "@media-center/domains/src/tmdb/applicative/searchTmdb.query";
import { Show } from "@media-center/domains/src/tmdb/domain/show";
import { FlatList, StyleSheet } from "react-native";
import { spacing } from "@media-center/ui/src/constants";
import { useAdditiveThrottle } from "../../services/hooks/useAdditiveThrottle";
import { Box } from "../../components/ui/display/box/box";
import { MovieCard } from "../../components/implementedUi/cards/movieCard/movieCard";
import { ShowCard } from "../../components/implementedUi/cards/showCard/showCard";
import { Section } from "../../components/ui/display/section/section";
import { TextInput } from "../../components/ui/input/textInput/textInput";
import { Beta } from "../../services/api/api";

export function SearchTmdb() {
  const [results, setResults] = useState<(Movie | Show)[]>([]);

  const updateSearch = useCallback(async (text: string) => {
    const newResults = await Beta.query(new SearchTmdbQuery(text));
    setResults(newResults);
  }, []);
  const { add, value } = useAdditiveThrottle(
    "",
    500,
    (v) => updateSearch(v),
    true,
  );

  const getItem = (item: Movie | Show) => {
    if (item instanceof Movie) {
      return <MovieCard movie={item} />;
    } else if (item instanceof Show) {
      return <ShowCard show={item} />;
    }
    return null;
  };

  return (
    <Box mt="S8" ml="S8" grow>
      <TextInput
        style={styles.input}
        autoFocus
        numberOfLines={1}
        placeholder="Rechercher"
        value={value}
        onChangeText={(newText) => add(() => newText)}
      />
      <Section title="Résultats" mt="S24" grow>
        <FlatList
          style={styles.list}
          contentContainerStyle={styles.content}
          columnWrapperStyle={styles.column}
          numColumns={8}
          data={results}
          keyExtractor={(r) => r.id.toString()}
          renderItem={({ item }) => getItem(item)}
        />
      </Section>
    </Box>
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
    flexBasis: 0,
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
    borderWidth: 2,
    borderColor: "transparent",
  },
});
