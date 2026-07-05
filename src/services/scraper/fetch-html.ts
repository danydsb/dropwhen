const PROXY_ROUTES: Record<string, string> = {
  'https://www.urban-comics.com': '/api/proxy/urban-comics',
}

const CACHE_TTL_MS = 5 * 60 * 1000
const htmlCache = new Map<string, { html: string; expiresAt: number }>()
const inFlight = new Map<string, Promise<string>>()

function toProxiedUrl(url: string): string {
  for (const [origin, prefix] of Object.entries(PROXY_ROUTES)) {
    if (url.startsWith(origin)) {
      return `${prefix}${url.slice(origin.length)}`
    }
  }
  return url
}

function readCache(url: string): string | null {
  const entry = htmlCache.get(url)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    htmlCache.delete(url)
    return null
  }
  return entry.html
}

function writeCache(url: string, html: string): void {
  htmlCache.set(url, { html, expiresAt: Date.now() + CACHE_TTL_MS })
}

async function fetchHtmlOnce(url: string): Promise<string> {
  const response = await fetch(toProxiedUrl(url), {
    headers: {
      Accept: 'text/html',
      'Accept-Language': 'fr-FR,fr;q=0.9',
    },
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`)
  }

  const html = await response.text()
  writeCache(url, html)
  return html
}

export async function fetchHtml(url: string): Promise<string> {
  const cached = readCache(url)
  if (cached) return cached

  const pending = inFlight.get(url)
  if (pending) return pending

  const promise = fetchHtmlOnce(url).finally(() => {
    inFlight.delete(url)
  })
  inFlight.set(url, promise)
  return promise
}
