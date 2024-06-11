import { defineConfig } from 'vite';
import version from 'vite-plugin-package-version';
import preload from 'vite-plugin-preload';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    target: 'esnext',
    entry: 'index.html',
  },
  plugins: [
    preload(),
    version(),
    VitePWA({
      devOptions: {
        enabled: true,
      },
      registerType: 'autoUpdate',
      manifest: {
        name: 'JSMusicDB',
        short_name: 'JSDB',
        lang: 'en-US',
        start_url: '/',
        id: 'https://www.jsmusicdb.com/',
        display: 'standalone',
        theme_color: '#0063B1',
        background_color: '#000000',
        orientation: 'portrait-primary',
        description: 'Music database and player built with webtechnology',
        display_override: ['window-controls-overlay'],
        launch_handler: {
          client_mode: 'focus-existing',
        },
        shortcuts: [
          {
            name: 'Previous track',
            url: '/?nav=prev',
            description: 'Previous track in playlist',
            icons: [
              {
                src: '/assets/shortcut_previous.png',
                sizes: '96x96',
              },
            ],
          },
          {
            name: 'Play or Pause',
            url: '/?nav=playpause',
            description: 'Play or pause current track',
            icons: [
              {
                src: '/assets/shortcut_playpause.png',
                sizes: '96x96',
              },
            ],
          },
          {
            name: 'Next track',
            url: '/?nav=next',
            description: 'Next track in playlist',
            icons: [
              {
                src: '/assets/shortcut_next.png',
                sizes: '96x96',
              },
            ],
          },
        ],
        dir: 'ltr',
        scope: 'https://www.jsmusicdb.com/',
        icons: [
          {
            src: '/assets/android-chrome-48x48.png',
            sizes: '48x48',
          },
          {
            src: '/assets/android-chrome-72x72.png',
            sizes: '72x72',
          },
          {
            src: '/assets/android-chrome-96x96.png',
            sizes: '96x96',
          },
          {
            src: '/assets/android-chrome-144x144.png',
            sizes: '144x144',
          },
          {
            src: '/assets/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/assets/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/assets/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/assets/maskable_icon.png',
            sizes: '256x256',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        categories: ['entertainment', 'music'],
        screenshots: [
          {
            src: '/assets/screenshot-1.webp',
            sizes: '1920x1040',
            type: 'image/webp',
          },
          {
            src: '/assets/screenshot-2.webp',
            sizes: '1920x1040',
            type: 'image/webp',
          },
          {
            src: '/assets/screenshot-3.webp',
            sizes: '1920x1032',
            type: 'image/webp',
          },
          {
            src: '/assets/screenshot-4.webp',
            sizes: '1920x1032',
            type: 'image/webp',
          },
          {
            src: '/assets/screenshot-5.webp',
            sizes: '1920x1032',
            type: 'image/webp',
          },
          {
            src: '/assets/screenshot-6.webp',
            sizes: '1920x1032',
            type: 'image/webp',
          },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /.*\/node-music\.json$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'node-music',
              expiration: {
                maxEntries: 1,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern:
              /.*user\.getrecenttracks.*$|.*\/node-music\.json\?update$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'livedata',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 1,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern:
              /\/listen|\/rescan|\/version|\/public-key|\/stream|file:\/\/|\/\/localhost|#no-sw-cache|ts=|\/proxy/,
            handler: 'NetworkOnly',
          },
          {
            urlPattern:
              /.*\.png$|.*\.gif$|.*\.jpg$|.*\.webp$|https:\/\/res.cloudinary\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: {
                maxEntries: 1000000,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern:
              /https:\/\/webservice.fanart.tv\/$|.*image\?mbid.*$|https:\/\/ws.audioscrobbler.com\/2\.0\/.*$|https:\/\/coverartarchive.org\/.*$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'XHR',
              expiration: {
                maxEntries: 1000000,
                maxAgeSeconds: 60 * 60 * 24 * 7,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
        maximumFileSizeToCacheInBytes: 20 * 1024 * 1024,
      },
    }),
  ],
});
