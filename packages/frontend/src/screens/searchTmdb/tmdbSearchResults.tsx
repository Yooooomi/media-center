import { AnyTmdb } from "@media-center/domains/src/tmdb/domain/anyTmdb";
import { Movie } from "@media-center/domains/src/tmdb/domain/movie";
import { Show } from "@media-center/domains/src/tmdb/domain/show";
import { FullScreenLoading } from "../../components/ui/display/fullScreenLoading";
import { LineList } from "../../components/ui/display/lineList";
import { Section } from "../../components/ui/display/section";
import { MovieCard } from "../../components/implementedUi/cards/movieCard";
import { ShowCard } from "../../components/implementedUi/cards/showCard";
import { useCardsInLine } from "../../services/hooks/useCardsInLine";

interface TmdbSearchResultsProps {
  loading: boolean;
  results: AnyTmdb[];
}

export function TmdbSearchResults({
  loading,
  results,
}: TmdbSearchResultsProps) {
  const { width, itemsPerLine } = useCardsInLine();

  const getItem = (item: Movie | Show) => {
    if (item instanceof Movie) {
      return <MovieCard width={width} movie={item} />;
    } else if (item instanceof Show) {
      return <ShowCard width={width} show={item} />;
    }
    return null;
  };

  return (
    <Section title="Résultats" grow>
      {loading ? (
        <FullScreenLoading />
      ) : (
        <LineList
          itemPerLine={itemsPerLine}
          data={results}
          keyExtractor={(r) => r.id.toString()}
          renderItem={(item) => getItem(item)}
        />
      )}
    </Section>
  );
}
