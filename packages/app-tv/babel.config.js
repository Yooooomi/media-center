module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    '@babel/plugin-transform-flow-strip-types',
    ['@babel/plugin-proposal-decorators', {version: 'legacy'}],
    ['@babel/plugin-transform-private-methods', {loose: true}],
    'react-native-reanimated/plugin',
  ],
};
