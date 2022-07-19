import versionInjector from 'rollup-plugin-version-injector';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    target: 'esnext',
    rollupOptions: {
      manualChunks: moduleID => {
        if (moduleID.includes('node_modules')) {
          return 'vendor';
        }
        return 'main';
      },
      plugins: [
        versionInjector({
          logLevel: 'warn',
        }),
      ],
    },
  },
});
