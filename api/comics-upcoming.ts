/**
 * Upcoming French comics / manga releases, read from publishers' "À paraître" pages.
 *
 * Glénat: https://www.glenat.com/a-paraitre/ lists the next ~3 months, 24 items per
 * page (/a-paraitre/2/, /3/…). Each page embeds its results as JSON (Next.js data),
 * so no HTML scraping of the layout is needed.
 */
export const config = {
  runtime: 'edge',
}

export interface UpcomingComic {
  id: string
  publisher: string
  title: string
  series?: string
  collection?: string
  /** 'manga' | 'bd' — from the publisher's imprint */
  kind: 'manga' | 'bd'
  /** ISO date (YYYY-MM-DD) */
  date: string
  ean?: string
  author?: string
  coverUrl?: string
  price?: number
  summary?: string
  url: string
}

const USER_AGENT = 'Mozilla/5.0 (compatible; DropWhen/1.0; release calendar)'
const GLENAT = 'https://www.glenat.com'
/** Safety cap: the list covers ~3 months, usually 5 pages. */
const MAX_PAGES = 10
const CACHE_TTL_MS = 6 * 60 * 60 * 1000
/** Glénat imprints that are not comics (essays, mountain books, children's picture books). */
const EXCLUDED_IMPRINTS = new Set(['glenat-livres', 'glenat-jeunesse'])

type GlenatRecord = Record<string, unknown[] | undefined>

function first<T = string>(record: GlenatRecord, key: string): T | undefined {
  return record[key]?.[0] as T | undefined
}

const NAMED_ENTITIES: Record<string, string> = {
  nbsp: ' ', amp: '&', quot: '"', apos: '’', lt: '<', gt: '>',
  rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”', laquo: '«', raquo: '»',
  hellip: '…', ndash: '–', mdash: '—', oelig: 'œ', OElig: 'Œ',
  eacute: 'é', egrave: 'è', ecirc: 'ê', euml: 'ë', agrave: 'à', acirc: 'â', auml: 'ä',
  icirc: 'î', iuml: 'ï', ocirc: 'ô', ouml: 'ö', ugrave: 'ù', ucirc: 'û', uuml: 'ü', ccedil: 'ç',
  Eacute: 'É', Egrave: 'È', Ecirc: 'Ê', Agrave: 'À', Acirc: 'Â', Ccedil: 'Ç', Ocirc: 'Ô',
}

function decodeEntities(text: string): string {
  return text.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, code: string) => {
    if (code.startsWith('#')) {
      const value = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : Number(code.slice(1))
      return Number.isFinite(value) ? String.fromCodePoint(value) : match
    }
    return NAMED_ENTITIES[code] ?? match
  })
}

function stripHtml(html?: string): string | undefined {
  if (!html) return undefined
  const text = decodeEntities(html.replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim()
  return text || undefined
}

function extractResults(html: string): { results: GlenatRecord[]; pageMax: number } {
  const json = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)?.[1]
  if (!json) throw new Error('Glénat: no page data')
  const data = JSON.parse(json) as {
    props?: { pageProps?: { sections?: Array<{ data?: { prefilter_results?: GlenatRecord[]; pageMax?: number } }> } }
  }
  const section = data.props?.pageProps?.sections?.find((item) => item.data?.prefilter_results)
  return {
    results: section?.data?.prefilter_results ?? [],
    pageMax: section?.data?.pageMax ?? 1,
  }
}

export function mapGlenatRecord(record: GlenatRecord): UpcomingComic | undefined {
  const path = first(record, 'path')
  const rawTitle = first(record, 'product__titre_de_couverture')
  const title = rawTitle ? decodeEntities(rawTitle) : undefined
  const date = first(record, 'product__date_parution__date')
  if (!path || !title || !date) return undefined

  const imprint = path.split('/')[1] ?? ''
  if (EXCLUDED_IMPRINTS.has(imprint)) return undefined

  const price = Number(first(record, 'product__price_ttc_or_numeric'))
  // Weekly digital chapters (0,49 €) would flood the list.
  if (/chapitre \d+/i.test(title) && price > 0 && price < 1) return undefined

  const ean = first(record, 'product__ean')
  return {
    id: `glenat-${ean ?? path}`,
    publisher: 'Glénat',
    title,
    series: first(record, 'product__serie_label') ? decodeEntities(first(record, 'product__serie_label')!) : undefined,
    collection: first(record, 'product__collection_label') ?? undefined,
    kind: imprint === 'glenat-manga' ? 'manga' : 'bd',
    date: date.slice(0, 10),
    ean,
    author: first(record, 'product__intervenant__principal_full_name') ?? undefined,
    coverUrl: first(record, 'product__image_de_couverture') || undefined,
    price: Number.isFinite(price) && price > 0 ? price : undefined,
    summary: stripHtml(first(record, 'product__presentation_editoriale')),
    url: `${GLENAT}${path}${path.endsWith('/') ? '' : '/'}`,
  }
}

async function fetchGlenatPage(page: number): Promise<{ results: GlenatRecord[]; pageMax: number }> {
  const url = page === 1 ? `${GLENAT}/a-paraitre/` : `${GLENAT}/a-paraitre/${page}/`
  const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
  if (!response.ok) throw new Error(`Glénat HTTP ${response.status}`)
  return extractResults(await response.text())
}

async function fetchGlenatUpcoming(): Promise<UpcomingComic[]> {
  const firstPage = await fetchGlenatPage(1)
  const pageCount = Math.min(firstPage.pageMax, MAX_PAGES)
  const others = await Promise.all(
    Array.from({ length: pageCount - 1 }, (_, index) => fetchGlenatPage(index + 2)),
  )

  const byId = new Map<string, UpcomingComic>()
  for (const record of [firstPage, ...others].flatMap((page) => page.results)) {
    const comic = mapGlenatRecord(record)
    if (comic) byId.set(comic.id, comic)
  }
  return [...byId.values()].sort((a, b) => a.date.localeCompare(b.date))
}

let cache: { expiresAt: number; value: { items: UpcomingComic[]; errors: string[] } } | undefined

export async function buildComicsUpcoming(): Promise<{ items: UpcomingComic[]; errors: string[] }> {
  if (cache && cache.expiresAt > Date.now()) return cache.value

  const errors: string[] = []
  let items: UpcomingComic[] = []
  try {
    items = await fetchGlenatUpcoming()
  } catch {
    errors.push('Glénat')
  }

  const value = { items, errors }
  if (errors.length === 0) cache = { expiresAt: Date.now() + CACHE_TTL_MS, value }
  return value
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify(await buildComicsUpcoming()), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, s-maxage=21600, stale-while-revalidate=86400',
    },
  })
}
