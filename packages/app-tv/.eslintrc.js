module.exports = {
  root: true,
  extends: [
    '@react-native',
    'plugin:import/recommended',
    'plugin:import/typescript',
  ],
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
        'import/no-default-export': ['error'],
        'import/no-useless-path-segments': [
          'error',
          {
            noUselessIndex: true,
          },
        ],
        'import/order': ['error'],
        'import/no-named-as-default-member': 'off',
      },
    },
  ],
  settings: {
    'import/resolver': {
      typescript: true,
      node: true,
    },
  },
};
