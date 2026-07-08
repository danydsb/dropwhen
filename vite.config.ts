import type { IncomingMessage, ServerResponse } from 'node:http'
import { defineConfig, loadEnv, type Plugin } from 'vite'
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

function igdbDevProxy(credentials: {
  clientId?: string
  clientSecret?: string
}): Plugin {
  let accessToken = ''
  let expiresAt = 0

  async function getAccessToken(): Promise<string> {
    if (accessToken && expiresAt > Date.now() + 60_000) {
      return accessToken
    }

    const clientId = credentials.clientId
    const clientSecret = credentials.clientSecret

    if (!clientId || !clientSecret) {
      throw new Error('IGDB_CLIENT_ID / IGDB_CLIENT_SECRET manquants dans l\'environnement')
    }

    const tokenUrl = new URL('https://id.twitch.tv/oauth2/token')
    tokenUrl.searchParams.set('client_id', clientId)
    tokenUrl.searchParams.set('client_secret', clientSecret)
    tokenUrl.searchParams.set('grant_type', 'client_credentials')

    const tokenResponse = await fetch(tokenUrl.toString(), { method: 'POST' })
    if (!tokenResponse.ok) {
      throw new Error(`Token Twitch invalide (HTTP ${tokenResponse.status})`)
    }

    const tokenData = (await tokenResponse.json()) as { access_token?: string; expires_in?: number }
    if (!tokenData.access_token || !tokenData.expires_in) {
      throw new Error('Réponse token Twitch invalide')
    }

    accessToken = tokenData.access_token
    expiresAt = Date.now() + tokenData.expires_in * 1000

    return accessToken
  }

  return {
    name: 'igdb-dev-proxy',
    configureServer(server) {
      server.middlewares.use('/api/igdb-proxy', async (req, res, next) => {
        if (req.method !== 'POST') {
          next()
          return
        }

        try {
          const chunks: Buffer[] = []
          for await (const chunk of req) {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
          }

          const rawBody = Buffer.concat(chunks).toString('utf8')
          const payload = JSON.parse(rawBody) as { endpoint?: string; query?: string }
          const endpoint = payload.endpoint?.trim()
          const query = payload.query?.trim()

          if (!endpoint || !query || !/^[a-z_]+$/i.test(endpoint)) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Invalid endpoint or query' }))
            return
          }

          const clientId = credentials.clientId
          if (!clientId) {
            throw new Error('IGDB_CLIENT_ID manquant')
          }

          const token = await getAccessToken()

          const upstream = await fetch(`https://api.igdb.com/v4/${endpoint}`, {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Client-ID': clientId,
              Authorization: `Bearer ${token}`,
            },
            body: query,
          })

          res.statusCode = upstream.status
          res.setHeader(
            'Content-Type',
            upstream.headers.get('content-type') ?? 'application/json; charset=utf-8',
          )
          res.end(await upstream.text())
        } catch (error) {
          const detail = error instanceof Error ? error.message : 'unknown error'
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: detail }))
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      urbanComicsDevProxy(),
      igdbDevProxy({
        clientId: env.IGDB_CLIENT_ID,
        clientSecret: env.IGDB_CLIENT_SECRET,
      }),
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
            urlPattern: /\/api\/igdb-proxy/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'igdb-api-cache',
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
  }
})
