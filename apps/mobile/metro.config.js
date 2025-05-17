const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Get the workspace root
const projectRoot = __dirname; // This is apps/mobile
const workspaceRoot = path.resolve(projectRoot, '../..'); // Moves up to the monorepo root

const config = getDefaultConfig(projectRoot);

// 1. Watch all files in the monorepo
config.watchFolders = [workspaceRoot];

// 2. Let Metro know where to resolve packages from
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'), // For apps/mobile/node_modules
  path.resolve(workspaceRoot, 'node_modules'), // For the hoisted root node_modules
];

// 3. Force Metro to resolve (sub)dependencies from the monorepo root
// This can be important for ensuring consistent versions of dependencies like React.
config.resolver.disableHierarchicalLookup = true;

// If you have custom source extensions, add them here. Otherwise, defaults are fine.
// config.resolver.sourceExts.push('...');

module.exports = config; 