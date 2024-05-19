import { spacing } from "@media-center/ui/src/constants";
import { cardNumber, screen } from "../cards";
import { isMobile } from "../platform";
import { PAGE_PADDING } from "./platform";

export function useCardsInLine() {
  const padding = spacing[PAGE_PADDING];

  const width = screen.width / cardNumber;
  const additionalCardWidth = isMobile() ? 0 : 4;
  const spacePadding = (spacing.S8 * (cardNumber - 1)) / cardNumber;
  const borderPadding = (padding * 2) / cardNumber;

  return {
    width: width - spacePadding - borderPadding - additionalCardWidth,
    itemsPerLine: cardNumber,
  };
}
