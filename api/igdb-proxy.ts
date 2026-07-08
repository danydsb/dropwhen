export const config = {
  runtime: 'edge',
}

type TokenCache = {
  accessToken: string
  expiresAt: number
}

let tokenCache: TokenCache | null = null

async function getAccessToken(clientId: string, clientSecret: string): Promise<string> {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 60_000) {
    return tokenCache.accessToken
  }

  const tokenUrl = new URL('https://id.twitch.tv/oauth2/token')
  tokenUrl.searchParams.set('client_id', clientId)
  tokenUrl.searchParams.set('client_secret', clientSecret)
  tokenUrl.searchParams.set('grant_type', 'client_credentials')

  const tokenResponse = await fetch(tokenUrl.toString(), { method: 'POST' })
  if (!tokenResponse.ok) {
    throw new Error(`Token request failed (HTTP ${tokenResponse.status})`)
  }

  const tokenData = (await tokenResponse.json()) as {
    access_token?: string
    expires_in?: number
  }

  if (!tokenData.access_token || !tokenData.expires_in) {
    throw new Error('Invalid token response from Twitch')
  }

  tokenCache = {
    accessToken: tokenData.access_token,
    expiresAt: Date.now() + tokenData.expires_in * 1000,
  }

  return tokenData.access_token
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const clientId = process.env.IGDB_CLIENT_ID
  const clientSecret = process.env.IGDB_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return new Response(
      JSON.stringify({ error: 'IGDB server credentials missing (IGDB_CLIENT_ID/IGDB_CLIENT_SECRET)' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }

  try {
    const body = (await request.json()) as { endpoint?: string; query?: string }
    const endpoint = body.endpoint?.trim()
    const query = body.query?.trim()

    if (!endpoint || !query) {
      return new Response(JSON.stringify({ error: 'Missing endpoint or query' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (!/^[a-z_]+$/i.test(endpoint)) {
      return new Response(JSON.stringify({ error: 'Invalid endpoint' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const accessToken = await getAccessToken(clientId, clientSecret)
    const upstream = await fetch(`https://api.igdb.com/v4/${endpoint}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Client-ID': clientId,
        Authorization: `Bearer ${accessToken}`,
      },
      body: query,
    })

    const text = await upstream.text()

    return new Response(text, {
      status: upstream.status,
      headers: {
        'Content-Type': upstream.headers.get('content-type') ?? 'application/json; charset=utf-8',
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
      },
    })
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'unknown error'
    return new Response(JSON.stringify({ error: detail }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
