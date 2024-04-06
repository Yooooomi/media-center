import { spacing } from "@media-center/ui/src/constants";
import { cardNumber, screen } from "../cards";
import { isMobile } from "../platform";

export function useCardsInLine() {
  const width = screen.width / cardNumber;
  const additionalCardWidth = isMobile() ? 0 : 4;
  const spacePadding = (spacing.S8 * (cardNumber - 1)) / cardNumber;
  const borderPadding = (spacing.S8 * 2) / cardNumber;

  return {
    width: width - spacePadding - borderPadding - additionalCardWidth,
    itemsPerLine: cardNumber,
  };
}
