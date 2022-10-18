import { defineConfig } from 'vite';
import { chunkSplitPlugin } from 'vite-plugin-chunk-split';
import loadVersion from 'vite-plugin-package-version';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    entry: 'index.html',
  },
  plugins: [
    loadVersion.default(),
    chunkSplitPlugin({
      strategy: 'default',
      customSplitting: {
        vendor: [/node_modules/],
        utils: [
          /src\/utils/,
          /src\/components\/last-fm/,
          /src\/components\/mp3stream/,
        ],
        styles: [/src\/styles/],
      },
    }),
  ],
});
