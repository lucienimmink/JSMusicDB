import merge from 'deepmerge';
import { createSpaConfig } from '@open-wc/building-rollup';
import copy from 'rollup-plugin-copy';
import filesize from 'rollup-plugin-filesize';
import versionInjector from 'rollup-plugin-version-injector';
import dotenv from 'rollup-plugin-dotenv';

const baseConfig = createSpaConfig({
  developmentMode: process.env.ROLLUP_WATCH === 'true',
  injectServiceWorker: false,
  workbox: false,
});

export default merge(baseConfig, {
  input: './index.html',
  plugins: [
    dotenv(),
    versionInjector({
      logLevel: 'warn',
    }),
    copy({
      targets: [{ src: 'static/**/*', dest: 'dist' }],
      // set flatten to false to preserve folder structure
      flatten: false,
    }),
    filesize(),
  ],
  manualChunks: moduleID => {
    if (moduleID.includes('node_modules')) {
      return 'vendor';
    } else {
      return 'main';
    }
  },
  output: [
    {
      dir: 'dist',
      format: 'esm',
      entryFileNames: '[name]-[hash].js',
      chunkFileNames: '[name]-[hash].js',
    },
  ],
});
