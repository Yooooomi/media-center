import { IntentReturning } from "@media-center/domain-driven";
import { GetShowPageQuery } from "@media-center/domains/src/queries/getShowPage.query";

export interface ShowWrappedProps {
  showPage: IntentReturning<GetShowPageQuery>;
  reload: () => void;
}
