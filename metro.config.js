const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

//функціонал
config.resolver.sourceExts.push('cjs');
config.resolver.unstable_enablePackageExports = false;

//підтримку SVG
const { assetExts, sourceExts } = config.resolver;
config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');
config.resolver.assetExts = assetExts.filter(ext => ext !== 'svg');
config.resolver.sourceExts = [...sourceExts, 'svg'];

module.exports = config;
