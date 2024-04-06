import { spacing } from "@media-center/ui/src/constants";
import { Dimensions, Platform } from "react-native";

const cardRatio = 500 / 750;
const hcardRatio = 24 / 15;

export const rawScreen = Dimensions.get("screen");

export const screen = Platform.select({
  default: rawScreen,
  web: {
    ...rawScreen,
    width: rawScreen.width - 250,
  },
});

export const cardNumber = Platform.select({
  default: Math.floor(screen.width / (350 / 4)),
  web: Math.floor(screen.width / (600 / 4)),
});

const cardSize = Platform.select({
  default: screen.width / cardNumber,
  web: screen.width / cardNumber,
});
const hcardSize = Platform.select({ default: 150, web: 210 });

export const card = {
  width: cardSize,
  ratio: 1 / cardRatio,
};

export const hcard = {
  width: hcardSize * hcardRatio,
  height: hcardSize,
};

const screenWithoutSider = {
  width: screen.width - 24 + 2 * spacing.S16,
  height: screen.width,
};
export const maxCardsPerLine = Math.floor(
  (screenWithoutSider.width - 32) / (card.width + 16),
);
