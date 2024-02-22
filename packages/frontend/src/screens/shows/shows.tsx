import { GetShowsPageQuery } from "@media-center/domains/src/queries/getShowsPage.query";
import { useQuery } from "@media-center/frontend/src/services/api/useQuery";
import { FullScreenLoading } from "../../components/ui/display/fullScreenLoading/fullScreenLoading";
import { Box } from "../../components/ui/display/box/box";
import { ShowCardsLine } from "../../components/implementedUi/showCardsLine/showCardsLine";
import { maxCardsPerLine } from "../../services/cards";

export function Shows() {
  const [{ result: shows }] = useQuery(GetShowsPageQuery, undefined);

  if (!shows) {
    return <FullScreenLoading />;
  }

  return (
    <Box grow p="S16">
      <ShowCardsLine
        autoFocusFirst
        title="Vos séries"
        shows={shows}
        itemPerLine={maxCardsPerLine}
      />
    </Box>
  );
}
