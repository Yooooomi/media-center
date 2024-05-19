import { useEffect, useState } from "react";
import { Movie } from "@media-center/domains/src/tmdb/domain/movie";
import { SearchTmdbQuery } from "@media-center/domains/src/tmdb/applicative/searchTmdb.query";
import { Show } from "@media-center/domains/src/tmdb/domain/show";
import { Beta } from "../../services/api/api";
import { BoxPadded } from "../../components/ui/display/boxPadded";
import { useParams } from "../navigation.dependency";
import { TmdbSearchResults } from "./tmdbSearchResults";

export function SearchTmdb() {
  const [results, setResults] = useState<(Movie | Show)[]>([]);
  const [loading, setLoading] = useState(false);

  const { q } = useParams<"SearchTmdb">();

  useEffect(() => {
    async function search(text: string) {
      setLoading(true);
      try {
        const newResults = await Beta.query(new SearchTmdbQuery(text));
        setResults(newResults);
      } catch (e) {}
      setLoading(false);
    }
    search(q).catch(console.error);
  }, [q]);

  return (
    <BoxPadded p="S16" grow>
      <TmdbSearchResults loading={loading} results={results} />
    </BoxPadded>
  );
}
