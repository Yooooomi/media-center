const path = require("path");
const {
  override,
  babelInclude,
  addWebpackAlias,
  addBabelPlugin,
} = require("customize-cra");

const emptyModules = ["fs", "path"].map((mdl) =>
  addWebpackAlias({ [mdl]: path.resolve("src/fake.js") }),
);

module.exports = override(
  ...emptyModules,
  addWebpackAlias({ "react-native$": "react-native-web" }),
  babelInclude([
    path.resolve("src"),
    path.resolve("../../packages/frontend/src"),
    path.resolve("../../packages/domains/src"),
    path.resolve("../../packages/domain-driven/src"),
    path.resolve("../../packages/algorithm/src"),
    path.resolve("../../packages/ui/src"),
  ]),
  addBabelPlugin("@babel/plugin-transform-flow-strip-types"),
  addBabelPlugin(["@babel/plugin-proposal-decorators", { version: "legacy" }]),
  addBabelPlugin(["@babel/plugin-transform-private-methods", { loose: true }]),
  // addBabelPlugin("@babel/plugin-transform-reserved-words"),
);
