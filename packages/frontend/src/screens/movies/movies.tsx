import { GetMoviesPageQuery } from "@media-center/domains/src/queries/getMoviesPage.query";
import { spacing } from "@media-center/ui/src/constants";
import { FullScreenLoading } from "../../components/ui/display/fullScreenLoading/fullScreenLoading";
import { useHeaderHeight } from "../../services/hooks/useHeaderHeight";
import { LineList } from "../../components/ui/display/lineList";
import { MovieCard } from "../../components/implementedUi/cards/movieCard";
import { useCardsInLine } from "../../services/hooks/useCardsInLine";
import { useQuery } from "@media-center/frontend/src/services/api/useQuery";

export function Movies() {
  const [{ result: movies }] = useQuery(GetMoviesPageQuery, undefined);
  const headerHeight = useHeaderHeight();

  const { width, itemsPerLine } = useCardsInLine();

  if (!movies) {
    return <FullScreenLoading />;
  }

  return (
    <LineList
      style={{ padding: spacing.S8, paddingTop: headerHeight + spacing.S8 }}
      keyExtractor={(e) => e.id.toString()}
      data={movies}
      renderItem={(item) => <MovieCard width={width} movie={item} />}
      itemPerLine={itemsPerLine}
    />
  );
}
