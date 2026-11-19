import { getUi } from '../i18n'
import type { ReleaseItem } from '../types'
import { formatDisplayDate, isPastRelease, matchesSearch } from '../utils/dates'

/** Mirror of api/comics-upcoming.ts */
interface UpcomingComic {
  id: string
  publisher: string
  title: string
  series?: string
  collection?: string
  kind: 'manga' | 'bd'
  date: string
  ean?: string
  author?: string
  coverUrl?: string
  price?: number
  summary?: string
  url: string
}

const CACHE_TTL_MS = 30 * 60 * 1000
const SPECIAL_EDITIONS: Array<[RegExp, string]> = [
  [/collector/i, 'Collector'],
  [/prestige/i, 'Prestige'],
  [/deluxe/i, 'Deluxe'],
  [/perfect/i, 'Perfect'],
  [/\bluxe\b/i, 'Luxe'],
  [/coffret|box set|pack\b/i, 'Coffret'],
  [/int[ée]grale/i, 'Intégrale'],
  [/limit[ée]e?/i, 'Limitée'],
]

let cache: { expiresAt: number; value: Promise<{ items: ReleaseItem[]; errors: string[] }> } | undefined

export function detectSpecialEdition(title: string): string | undefined {
  return SPECIAL_EDITIONS.find(([pattern]) => pattern.test(title))?.[1]
}

function formatPrice(price?: number): string | undefined {
  return price ? `${price.toFixed(2).replace('.', ',')} €` : undefined
}

function toReleaseItem(comic: UpcomingComic): ReleaseItem {
  const special = detectSpecialEdition(comic.title)
  return {
    id: comic.id,
    category: 'comics',
    title: comic.title,
    releaseDate: comic.date,
    releaseDateLabel: formatDisplayDate(comic.date),
    dateCertainty: 'confirmed',
    isReleased: isPastRelease(comic.date),
    developer: comic.author,
    publisher: comic.publisher,
    platformOrPublisher: [comic.publisher, comic.collection, formatPrice(comic.price)].filter(Boolean).join(' · '),
    genres: comic.series && comic.series !== comic.title ? [comic.series] : undefined,
    imageUrl: comic.coverUrl,
    summary: comic.summary,
    bookKind: comic.kind,
    specialEdition: special,
    gameTypeLabel: special,
    source: comic.publisher,
    sourceUrl: comic.url,
  }
}

async function load(): Promise<{ items: ReleaseItem[]; errors: string[] }> {
  const response = await fetch('/api/comics-upcoming', { headers: { Accept: 'application/json' } })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const data = (await response.json()) as { items: UpcomingComic[]; errors: string[] }
  return { items: data.items.map(toReleaseItem), errors: data.errors }
}

/** Upcoming French releases from publishers' "À paraître" pages (Glénat for now). */
export function fetchUpcomingComics(): Promise<{ items: ReleaseItem[]; errors: string[] }> {
  if (!cache || cache.expiresAt < Date.now()) {
    const value = load().catch((error) => {
      cache = undefined
      throw error
    })
    cache = { expiresAt: Date.now() + CACHE_TTL_MS, value }
  }
  return cache.value
}

/** Upcoming releases matching a search (title, series, author). */
export async function searchUpcomingComics(query: string): Promise<ReleaseItem[]> {
  try {
    const { items } = await fetchUpcomingComics()
    return items.filter((item) =>
      matchesSearch([item.title, ...(item.genres ?? []), item.developer].filter(Boolean).join(' '), query),
    )
  } catch {
    return []
  }
}

export function getUpcomingComicsWarning(errors: string[]): string | undefined {
  return errors.length > 0 ? getUi().comicsCalendar.partialWarning(errors.join(', ')) : undefined
}
