import { GetMoviesPageQuery } from "@media-center/domains/src/queries/getMoviesPage.query";
import { spacing } from "@media-center/ui/src/constants";
import { FullScreenLoading } from "../../components/ui/display/fullScreenLoading/fullScreenLoading";
import { cardNumber, screen } from "../../services/cards";
import { useHeaderHeight } from "../../services/hooks/useHeaderHeight";
import { LineList } from "../../components/ui/display/lineList";
import { MovieCard } from "../../components/implementedUi/cards/movieCard";
import { isMobile } from "../../services/platform";
import { useQuery } from "@media-center/frontend/src/services/api/useQuery";

export function Movies() {
  const [{ result: movies }] = useQuery(GetMoviesPageQuery, undefined);
  const headerHeight = useHeaderHeight();

  if (!movies) {
    return <FullScreenLoading />;
  }

  const width = screen.width / cardNumber;
  const additionalCardWidth = isMobile() ? 0 : 4;
  const spacePadding = (spacing.S8 * (cardNumber - 1)) / cardNumber;
  const borderPadding = (spacing.S8 * 2) / cardNumber;

  console.log(width - spacePadding - borderPadding);

  return (
    <LineList
      style={{ padding: spacing.S8, paddingTop: headerHeight + spacing.S8 }}
      keyExtractor={(e) => e.id.toString()}
      data={movies}
      renderItem={(item) => (
        <MovieCard
          width={width - spacePadding - borderPadding - additionalCardWidth}
          movie={item}
        />
      )}
      itemPerLine={cardNumber}
    />
  );
}
