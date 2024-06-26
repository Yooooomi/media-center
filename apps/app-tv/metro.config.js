const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

// Find the project and workspace directories
const projectRoot = __dirname;
// This can be replaced with `find-yarn-workspace-root`
const workspaceRoot = path.resolve(projectRoot, "../..");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo
config.watchFolders = [workspaceRoot];
// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];
const oldResolver = config.resolver.resolveRequest;

config.resolver.sourceExts = [
  ...config.resolver.sourceExts.map((e) => `tv.${e}`),
  ...config.resolver.sourceExts,
];

/** @type {NonNullable<import('expo/metro-config').MetroConfig['resolver']['resolveRequest']>} */
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "path" || moduleName === "fs") {
    return { type: "empty" };
  }
  if (moduleName.endsWith(".dependency")) {
    const moduleNameOnly = path.basename(moduleName);
    const [injectionName] = moduleNameOnly.split(".dependency");
    return {
      type: "sourceFile",
      filePath: path.join(
        projectRoot,
        "src",
        "services",
        "injection",
        `${injectionName}.injected.tsx`,
      ),
    };
  }
  if (oldResolver) {
    return oldResolver(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};
config.transformer.getTransformOptions = () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

module.exports = config;
