export const config = {
  runtime: 'edge',
}

export default async function handler(request: Request): Promise<Response> {
  const incoming = new URL(request.url)
  const pathParam = incoming.searchParams.get('path') ?? ''
  incoming.searchParams.delete('path')

  const target = new URL(`https://www.urban-comics.com/${pathParam}`)
  target.search = incoming.search

  const upstream = await fetch(target.toString(), {
    headers: {
      Accept: request.headers.get('accept') ?? 'text/html,application/xhtml+xml',
      'Accept-Language': 'fr-FR,fr;q=0.9',
    },
    redirect: 'follow',
  })

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      'Content-Type': upstream.headers.get('content-type') ?? 'text/html; charset=utf-8',
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  })
}
