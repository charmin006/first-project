const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for web platform
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Handle native dependencies for web
config.resolver.alias = {
  ...config.resolver.alias,
  // Provide web-safe alternatives for native modules
  'expo-camera': require.resolve('./src/services/ocrService.web.ts'),
  'expo-media-library': require.resolve('./src/services/ocrService.web.ts'),
  'expo-notifications': require.resolve('./src/services/notifications.web.ts'),
  'expo-file-system': require.resolve('./src/services/ocrService.web.ts'),
  'expo-print': require.resolve('./src/services/ocrService.web.ts'),
  'expo-sharing': require.resolve('./src/services/ocrService.web.ts'),
};

module.exports = config; 