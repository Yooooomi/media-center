const path = require("path");
const {
  override,
  babelInclude,
  addWebpackAlias,
  addBabelPlugin,
  addWebpackPlugin,
} = require("customize-cra");
const webpack = require("webpack");

const emptyModules = ["fs", "path", "crypto"].map((mdl) =>
  addWebpackAlias({ [mdl]: path.resolve("src/fake.js") }),
);

const IS_DEV = process.env.NODE_ENV === "development";

module.exports = override(
  ...emptyModules,
  addWebpackAlias({ "react-native$": "react-native-web" }),
  addWebpackPlugin(
    new webpack.DefinePlugin({
      __DEV__: IS_DEV,
    }),
  ),
  babelInclude([
    path.resolve("src"),
    path.resolve("../../packages/frontend/src"),
    path.resolve("../../packages/domains/src"),
    path.resolve("../../packages/domain-driven/src"),
    path.resolve("../../packages/algorithm/src"),
    path.resolve("../../packages/ui/src"),
    path.resolve("../../packages/video-player/src"),
    path.resolve("../../packages/web-video-player/src"),
    path.resolve("../../node_modules"),
  ]),
  addBabelPlugin("@babel/plugin-transform-flow-strip-types"),
  addBabelPlugin(["@babel/plugin-proposal-decorators", { version: "legacy" }]),
  addBabelPlugin(["@babel/plugin-transform-private-methods", { loose: true }]),
  addBabelPlugin("@babel/plugin-proposal-export-namespace-from"),
  addBabelPlugin("react-native-reanimated/plugin"),
);
