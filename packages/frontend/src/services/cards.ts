import { spacing } from "@media-center/ui/src/constants";
import { Dimensions, Platform } from "react-native";
import { isTV } from "./platform";

export const cardRatio = 500 / 750;
const hcardRatio = 24 / 15;

export const rawScreen = Dimensions.get("screen");

export const screen = Platform.select({
  default: isTV()
    ? {
        ...rawScreen,
        width: rawScreen.width - (24 + 2 * spacing.S16),
      }
    : rawScreen,
  web: {
    ...rawScreen,
    width: rawScreen.width - 250,
  },
});

export const cardNumber = Platform.select({
  default: isTV()
    ? Math.floor(screen.width / (400 / 4))
    : Math.floor(screen.width / (350 / 4)),
  web: Math.floor(screen.width / (600 / 4)),
});

const cardSize = screen.width / cardNumber;
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
