import type { IncomingMessage, ServerResponse } from 'node:http'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

function urbanComicsDevProxy(): Plugin {
  return {
    name: 'urban-comics-dev-proxy',
    configureServer(server) {
      server.middlewares.use(
        '/api/urban-comics-proxy',
        async (req: IncomingMessage, res: ServerResponse, next) => {
          if (req.method !== 'GET' && req.method !== 'HEAD') {
            next()
            return
          }

          try {
            const url = new URL(req.url ?? '/', 'http://localhost')
            const pathParam = url.searchParams.get('path') ?? ''
            url.searchParams.delete('path')
            const target = new URL(`https://www.urban-comics.com/${pathParam}`)
            target.search = url.search

            const upstream = await fetch(target.toString(), {
              headers: {
                Accept: req.headers.accept ?? 'text/html',
                'Accept-Language': 'fr-FR,fr;q=0.9',
              },
              redirect: 'follow',
            })

            res.statusCode = upstream.status
            res.setHeader(
              'Content-Type',
              upstream.headers.get('content-type') ?? 'text/html; charset=utf-8',
            )
            res.end(await upstream.text())
          } catch {
            next()
          }
        },
      )
    },
  }
}

export default defineConfig({
  plugins: [
    urbanComicsDevProxy(),
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'DropWhen',
        short_name: 'DropWhen',
        description: 'Recherchez les dates de sortie de jeux et BD/comics',
        theme_color: '#fff4e5',
        background_color: '#fff4e5',
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
            urlPattern: /\/api\/urban-comics-proxy/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'urban-comics-cache',
              expiration: { maxEntries: 30, maxAgeSeconds: 3600 },
            },
          },
          {
            urlPattern: /^https:\/\/openlibrary\.org\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'open-library-cache',
              expiration: { maxEntries: 40, maxAgeSeconds: 3600 },
            },
          },
        ],
      },
    }),
  ],
})
