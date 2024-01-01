import {Dimensions} from 'react-native';

export const spacing = {
  S0: 0,
  S2: 2,
  S4: 4,
  S8: 8,
  S12: 12,
  S16: 16,
  S24: 24,
  S32: 32,
} as const;

export const radius = {
  small: 2,
  default: 4,
  big: 16,
  max: 10000,
} as const;

export const fontSize = {
  big: 30,
  title: 24,
  default: 18,
  smaller: 15,
  small: 12,
  tiny: 8,
};

export const rawColor = {
  white: '#ffffff',
  black: '#000000',
  green: '#37A934',
  red: '#FF0000',
  grey: '#d6d6d6',
  darkgrey: '#05161E',
  greyy: '#181A27',
  textondarkgrey: '#2E3B42',
  lightgrey: '#e6e6e6',
  transparent: '#00000000',
  blue: '#169AFE',
  // t_greyed: '#e6e6e669',
  // t_white: '#ffffff99',
};

export const color = {
  background: rawColor.greyy,
  lightBackground: rawColor.darkgrey,
  text: rawColor.grey,
  whiteText: rawColor.white,
  darkText: rawColor.black,

  buttonText: rawColor.white,
  buttonTextFocused: rawColor.black,
  buttonTextDisabled: rawColor.grey,
  buttonBackground: rawColor.transparent,
  buttonBackgroundFocused: rawColor.white,
  buttonBackgroundDisabled: rawColor.transparent,

  textInputText: rawColor.black,
  textInputTextFocused: rawColor.black,
  textInputBackground: rawColor.lightgrey,
  textInputBackgroundFocused: rawColor.white,

  ctaGreen: rawColor.green,
  error: rawColor.red,
  statusOK: rawColor.green,
  statusKO: rawColor.red,
  divider: rawColor.lightgrey,

  progress: rawColor.blue,
};

export function opacify(c: keyof typeof color, t: number) {
  return `${color[c]}${Math.floor(t * 256)
    .toString(16)
    .padStart(2, '0')}`;
}

export const debugBorder = (c = 'red') => ({
  borderWidth: 2,
  borderColor: c,
});

export const durations = {
  default: 175,
};

export const card = {
  width: 90,
  height: 140,
};

export const hcard = {
  width: 240,
  height: 150,
};

export const cardShadow = {
  shadowColor: rawColor.black,
  shadowOffset: {
    height: 0,
    width: 0,
  },
  shadowOpacity: 1,
  shadowRadius: 10,
  elevation: 10,
};

export const shadows = {
  default: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 9,
    },
    shadowOpacity: 0.48,
    shadowRadius: 11.95,

    elevation: 18,
  },
};

export const screen = Dimensions.get('screen');
export const screenWithoutSider = {
  width: screen.width - 24 + 2 * spacing.S16,
  height: screen.height,
};
export const maxCardsPerLine = Math.floor(
  (screenWithoutSider.width - 32) / (card.width + 16),
);
export const maxHCardsPerLine = Math.floor(
  (screenWithoutSider.width - 32) / (hcard.width + 16),
);
