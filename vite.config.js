import { defineConfig } from 'vite';
import loadVersion from 'vite-plugin-package-version';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    entry: 'index.html',
    emptyOutDir: true,
  },
  plugins: [
    loadVersion.default(),
  ],
});
