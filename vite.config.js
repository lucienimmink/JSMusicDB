import versionInjector from 'rollup-plugin-version-injector';
import { defineConfig } from 'vite';
import { chunkSplitPlugin } from 'vite-plugin-chunk-split';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    entry: 'index.html',
    rollupOptions: {
      plugins: [
        versionInjector({
          logLevel: 'warn',
        }),
      ],
    },
  },
  plugins: [
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
