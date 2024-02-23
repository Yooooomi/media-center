import { spacing } from "@media-center/ui/src/constants";
import { Dimensions, Platform } from "react-native";

const cardRatio = 9 / 14;
const hcardRatio = 24 / 15;

const cardSize = Platform.select({ default: 140, web: 200 });
const hcardSize = Platform.select({ default: 150, web: 210 });

export const card = {
  width: cardSize * cardRatio,
  height: cardSize,
};

export const hcard = {
  width: hcardSize * hcardRatio,
  height: hcardSize,
};

const screen = Dimensions.get("screen");
const screenWithoutSider = {
  width: screen.width - 24 + 2 * spacing.S16,
  height: screen.height,
};
export const maxCardsPerLine = Math.floor(
  (screenWithoutSider.width - 32) / (card.width + 16),
);
