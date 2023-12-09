const {mergeConfig, getDefaultConfig} = require('@react-native/metro-config');

const path = require('path');

// Find the project and workspace directories
const projectRoot = __dirname;
// This can be replaced with `find-yarn-workspace-root`
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = {
  // 1. Watch all files within the monorepo
  watchFolders: [workspaceRoot],

  // 2. Let Metro know where to resolve packages and in what order
  resolver: {
    nodeModulesPaths: [
      path.resolve(projectRoot, 'node_modules'),
      path.resolve(workspaceRoot, 'node_modules'),
    ],
    disableHierarchicalLookup: true,
  },

  // 3. Force Metro to resolve (sub)dependencies only from the `nodeModulesPaths`
  transformer: {
    getTransformOptions: () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
