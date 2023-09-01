export const spacing = {
  S4: 4,
  S8: 8,
  S12: 12,
  S16: 16,
  S24: 24,
} as const;

export const radius = {
  small: 4,
  default: 8,
  big: 16,
} as const;

export const fontSize = {
  big: 30,
  title: 24,
  default: 18,
};

export const color = {
  white: '#ffffff',
  black: '#000000',
  green: '#00FF00',
  red: '#FF0000',
  grey: '#d6d6d6',
};

export const debugBorder = (c = 'red') => ({
  borderWidth: 2,
  borderColor: c,
});

export const durations = {
  default: 250,
};
