import { card, spacing } from "@media-center/ui/src/constants";
import { Dimensions } from "react-native";

const screen = Dimensions.get("screen");
const screenWithoutSider = {
  width: screen.width - 24 + 2 * spacing.S16,
  height: screen.height,
};
export const maxCardsPerLine = Math.floor(
  (screenWithoutSider.width - 32) / (card.width + 16),
);
