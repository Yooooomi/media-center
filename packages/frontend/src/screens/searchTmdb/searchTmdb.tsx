import { useEffect, useState } from "react";
import { Movie } from "@media-center/domains/src/tmdb/domain/movie";
import { SearchTmdbQuery } from "@media-center/domains/src/tmdb/applicative/searchTmdb.query";
import { Show } from "@media-center/domains/src/tmdb/domain/show";
import { StyleSheet } from "react-native";
import { spacing } from "@media-center/ui/src/constants";
import { useAdditiveThrottle } from "../../services/hooks/useAdditiveThrottle";
import { TextInput } from "../../components/ui/input/textInput/textInput";
import { Beta } from "../../services/api/api";
import { BoxPadded } from "../../components/ui/display/boxPadded";
import { isMobile } from "../../services/platform";
import { useParams } from "../navigation.dependency";
import { TmdbSearchResults } from "./tmdbSearchResults";

export function SearchTmdb() {
  const [results, setResults] = useState<(Movie | Show)[]>([]);
  const [loading, setLoading] = useState(false);
  const { q, setParam } = useParams<"SearchTmdb">();

  useEffect(() => {
    async function search(text: string) {
      setLoading(true);
      try {
        const newResults = await Beta.query(new SearchTmdbQuery(text));
        setResults(newResults);
      } catch (e) {}
      setLoading(false);
    }
    if (q.length > 0) {
      search(q).catch(console.error);
    }
  }, [q]);

  const { add, value } = useAdditiveThrottle(
    "",
    500,
    (v) => setParam("q", v),
    true,
  );

  return (
    <BoxPadded p="S8" grow>
      <TextInput
        style={styles.input}
        autoFocus
        numberOfLines={1}
        placeholder="Rechercher"
        value={value}
        onChangeText={(newText) => add(() => newText)}
        returnKeyType="search"
      />
      <TmdbSearchResults loading={loading} results={results} />
    </BoxPadded>
  );
}

const styles = StyleSheet.create({
  list: {
    flexGrow: 1,
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
    width: isMobile() ? "100%" : 300,
    borderWidth: 2,
    borderColor: "transparent",
    marginBottom: spacing.S8,
  },
});
