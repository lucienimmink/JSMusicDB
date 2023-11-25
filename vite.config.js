import { defineConfig } from 'vite';
import loadVersion from 'vite-plugin-package-version';
import preload from "vite-plugin-preload";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    target: 'esnext',
    entry: 'index.html',
  },
  plugins: [preload(), loadVersion.default()],
});
