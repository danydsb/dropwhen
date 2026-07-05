import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  server: {
    proxy: {
      '/api/proxy/urban-comics': {
        target: 'https://www.urban-comics.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/proxy\/urban-comics\/?/, '/'),
      },
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'DropWhen',
        short_name: 'DropWhen',
        description: 'Recherchez les dates de sortie de jeux et BD/comics',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.rawg\.io\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'rawg-api-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 3600 },
            },
          },
          {
            urlPattern: /\/api\/proxy\/urban-comics\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'urban-comics-cache',
              expiration: { maxEntries: 30, maxAgeSeconds: 3600 },
            },
          },
        ],
      },
    }),
  ],
})
