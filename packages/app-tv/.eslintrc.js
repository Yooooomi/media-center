module.exports = {
  root: true,
  extends: '@react-native',
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/no-shadow': ['error'],
        'react/react-in-jsx-scope': 'off',
        'no-shadow': 'off',
        'no-undef': 'off',
      },
    },
  ],
};
