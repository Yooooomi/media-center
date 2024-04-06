import { GetShowsPageQuery } from "@media-center/domains/src/queries/getShowsPage.query";
import { spacing } from "@media-center/ui/src/constants";
import { FullScreenLoading } from "../../components/ui/display/fullScreenLoading/fullScreenLoading";
import { useHeaderHeight } from "../../services/hooks/useHeaderHeight";
import { ShowCard } from "../../components/implementedUi/cards/showCard";
import { LineList } from "../../components/ui/display/lineList";
import { cardNumber, screen } from "../../services/cards";
import { isMobile } from "../../services/platform";
import { useQuery } from "@media-center/frontend/src/services/api/useQuery";

export function Shows() {
  const [{ result: shows }] = useQuery(GetShowsPageQuery, undefined);
  const headerHeight = useHeaderHeight();

  if (!shows) {
    return <FullScreenLoading />;
  }

  const width = screen.width / cardNumber;
  const additionalCardWidth = isMobile() ? 0 : 4;
  const spacePadding = (spacing.S8 * (cardNumber - 1)) / cardNumber;
  const borderPadding = (spacing.S8 * 2) / cardNumber;

  return (
    <LineList
      style={{ padding: spacing.S8, paddingTop: headerHeight + spacing.S8 }}
      keyExtractor={(e) => e.id.toString()}
      data={shows}
      renderItem={(item) => (
        <ShowCard
          width={width - spacePadding - borderPadding - additionalCardWidth}
          show={item}
        />
      )}
      itemPerLine={cardNumber}
    />
  );
}
