module.exports = {
  root: true,
  extends: [
    "plugin:import/recommended",
    "plugin:import/typescript",
    "plugin:prettier/recommended",
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  rules: {
    "@typescript-eslint/no-shadow": ["error"],
    "no-shadow": "off",
    "no-undef": "off",
    "import/no-default-export": ["error"],
    "import/no-useless-path-segments": [
      "error",
      {
        noUselessIndex: true,
      },
    ],
    "import/order": ["error"],
    "import/no-named-as-default-member": "off",
    "import/no-named-as-default": "off",
  },
  ignorePatterns: ["lib"],
  settings: {
    "import/resolver": {
      typescript: true,
      node: true,
    },
  },
};
