const DEFAULT_PROXY = 'https://api.allorigins.win/raw?url='

function getProxyBase(): string {
  const configured = import.meta.env.VITE_CORS_PROXY?.trim()
  if (!configured) return DEFAULT_PROXY
  return configured.endsWith('=') || configured.endsWith('/')
    ? configured
    : `${configured}?url=`
}

export async function fetchViaProxy(url: string): Promise<Response> {
  const response = await fetch(`${getProxyBase()}${encodeURIComponent(url)}`)
  if (!response.ok) throw new Error(`CORS proxy unavailable (HTTP ${response.status})`)
  return response
}

export async function fetchTextViaProxy(url: string): Promise<string> {
  return (await fetchViaProxy(url)).text()
}

export async function fetchJsonViaProxy<T>(url: string): Promise<T> {
  return JSON.parse(await fetchTextViaProxy(url)) as T
}

export async function fetchWithCorsFallback(url: string, init?: RequestInit): Promise<Response> {
  try {
    const direct = await fetch(url, init)
    if (direct.ok) return direct
  } catch {
    // fall through to proxy
  }
  return fetchViaProxy(url)
}
