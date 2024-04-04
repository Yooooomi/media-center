import { GetShowsPageQuery } from "@media-center/domains/src/queries/getShowsPage.query";
import { FullScreenLoading } from "../../components/ui/display/fullScreenLoading/fullScreenLoading";
import { SafeAreaBox } from "../../components/ui/display/box/box";
import { ShowCardsLine } from "../../components/implementedUi/showCardsLine/showCardsLine";
import { maxCardsPerLine } from "../../services/cards";
import { useQuery } from "@media-center/frontend/src/services/api/useQuery";

export function Shows() {
  const [{ result: shows }] = useQuery(GetShowsPageQuery, undefined);

  if (!shows) {
    return <FullScreenLoading />;
  }

  return (
    <SafeAreaBox grow m="S16">
      <ShowCardsLine
        autoFocusFirst
        title="Vos séries"
        shows={shows}
        itemPerLine={maxCardsPerLine}
      />
    </SafeAreaBox>
  );
}
