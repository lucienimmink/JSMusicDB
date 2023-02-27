import { defineConfig } from 'vite';
import loadVersion from 'vite-plugin-package-version';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    target: 'esnext',
    entry: 'index.html',
  },
  plugins: [loadVersion.default()],
});
