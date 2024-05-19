export const spacing = {
  S0: 0,
  S2: 2,
  S4: 4,
  S8: 8,
  S12: 12,
  S16: 16,
  S24: 24,
  S32: 32,
  S48: 48,
} as const;

export type Spacing = keyof typeof spacing;
export type AutoSpacing = Spacing | "auto";

export function getSpacing(sp: AutoSpacing | undefined) {
  if (!sp) {
    return undefined;
  }
  if (sp === "auto") {
    return "auto";
  }
  return spacing[sp];
}

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
  white: "#ffffff",
  black: "#000000",
  green: "#37A934",
  red: "#FF0000",
  grey: "#d6d6d6",
  darkgrey: "#05161E",
  greyy: "#222222",
  textondarkgrey: "#2E3B42",
  lightgrey: "#e6e6e6",
  transparent: "#00000000",
  blue: "#169AFE",
  // t_greyed: '#e6e6e669',
  // t_white: '#ffffff99',
};

export const color = {
  background: rawColor.greyy,
  darkBackground: shadeColor(rawColor.greyy, -0.4),
  text: rawColor.grey,
  textFaded: opacifyRaw(rawColor.white, 0.9),
  whiteText: rawColor.white,
  darkText: rawColor.black,

  buttonText: rawColor.white,
  buttonTextFocused: rawColor.black,
  buttonTextDisabled: rawColor.grey,

  buttonBackground: rawColor.transparent,
  buttonBackgroundFaded: opacifyRaw(rawColor.white, 0.3),
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

export type Color = keyof typeof color;

export function getColor(c: Color | undefined) {
  if (!c) {
    return undefined;
  }
  return color[c];
}

function shadeColor(c: string, percent: number) {
  let R = parseInt(c.substring(1, 3), 16);
  let G = parseInt(c.substring(3, 5), 16);
  let B = parseInt(c.substring(5, 7), 16);

  R = Math.floor(R * (1 + percent));
  G = Math.floor(G * (1 + percent));
  B = Math.floor(B * (1 + percent));

  R = R < 255 ? R : 255;
  G = G < 255 ? G : 255;
  B = B < 255 ? B : 255;

  R = Math.round(R);
  G = Math.round(G);
  B = Math.round(B);

  let RR = R.toString(16).length === 1 ? "0" + R.toString(16) : R.toString(16);
  let GG = G.toString(16).length === 1 ? "0" + G.toString(16) : G.toString(16);
  let BB = B.toString(16).length === 1 ? "0" + B.toString(16) : B.toString(16);

  return "#" + RR + GG + BB;
}

export function opacifyRaw(c: string, t: number) {
  return `${c}${Math.floor(t * 256)
    .toString(16)
    .padStart(2, "0")}`;
}

export function opacify(c: keyof typeof color, t: number) {
  return opacifyRaw(color[c], t);
}

export const debugBorder = (c = "red") => ({
  borderWidth: 2,
  borderColor: c,
});

export const durations = {
  default: 175,
};

export const shadows = {
  default: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 9,
    },
    shadowOpacity: 0.48,
    shadowRadius: 12,

    elevation: 18,
  },
  light: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 18,

    elevation: 14,
  }
};

export const cardShadow = shadows.light;