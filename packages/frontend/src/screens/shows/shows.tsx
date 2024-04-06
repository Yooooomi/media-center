import { GetShowsPageQuery } from "@media-center/domains/src/queries/getShowsPage.query";
import { spacing } from "@media-center/ui/src/constants";
import { FullScreenLoading } from "../../components/ui/display/fullScreenLoading/fullScreenLoading";
import { useHeaderHeight } from "../../services/hooks/useHeaderHeight";
import { ShowCard } from "../../components/implementedUi/cards/showCard";
import { LineList } from "../../components/ui/display/lineList";
import { useCardsInLine } from "../../services/hooks/useCardsInLine";
import { useQuery } from "@media-center/frontend/src/services/api/useQuery";

export function Shows() {
  const [{ result: shows }] = useQuery(GetShowsPageQuery, undefined);
  const headerHeight = useHeaderHeight();
  const { width, itemsPerLine } = useCardsInLine();

  if (!shows) {
    return <FullScreenLoading />;
  }

  return (
    <LineList
      style={{ padding: spacing.S8, paddingTop: headerHeight + spacing.S8 }}
      keyExtractor={(e) => e.id.toString()}
      data={shows}
      renderItem={(item) => <ShowCard width={width} show={item} />}
      itemPerLine={itemsPerLine}
    />
  );
}
