import { GetMoviesPageQuery } from "@media-center/domains/src/queries/getMoviesPage.query";
import { useQuery } from "@media-center/frontend/src/services/api/useQuery";
import { FullScreenLoading } from "../../components/ui/display/fullScreenLoading/fullScreenLoading";
import { MovieCardsLine } from "../../components/implementedUi/movieCardsLine/movieCardsLine";
import { Box } from "../../components/ui/display/box/box";
import { maxCardsPerLine } from "../../services/cards";

export function Movies() {
  const [{ result: movies }] = useQuery(GetMoviesPageQuery, undefined);

  if (!movies) {
    return <FullScreenLoading />;
  }

  return (
    <Box grow p="S16">
      <MovieCardsLine
        autoFocusFirst
        title="Vos films"
        movies={movies}
        itemPerLine={maxCardsPerLine}
      />
    </Box>
  );
}
