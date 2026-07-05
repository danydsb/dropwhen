import { ui } from '../i18n'
import type { ReleaseItem, SearchResult } from '../types'
import {
  formatDisplayDate,
  isFutureOrToday,
  matchesSearch,
  parseRssDate,
} from '../utils/dates'
import { searchMangaAniList } from './anilist'
import { fetchTextViaProxy } from './cors-proxy'

const RSSHUB_BASE = import.meta.env.VITE_RSSHUB_BASE?.trim() || 'https://rsshub.app'

function parseRssItems(xml: string) {
  const doc = new DOMParser().parseFromString(xml, 'text/xml')
  if (doc.querySelector('parsererror')) throw new Error('Invalid RSS feed')
  return Array.from(doc.querySelectorAll('item')).map((item) => ({
    title: item.querySelector('title')?.textContent?.trim() ?? ui.dates.untitled,
    link: item.querySelector('link')?.textContent?.trim(),
    pubDate: item.querySelector('pubDate')?.textContent?.trim(),
    category: item.querySelector('category')?.textContent?.trim(),
  }))
}

function mapNautiljonItem(item: ReturnType<typeof parseRssItems>[number]): ReleaseItem {
  const releaseDate = parseRssDate(item.pubDate)
  return {
    id: `nautiljon-${item.link ?? item.title}`,
    title: item.title,
    releaseDate,
    releaseDateLabel: releaseDate ? formatDisplayDate(releaseDate) : ui.dates.frUnknown,
    dateCertainty: releaseDate ? 'confirmed' : 'unknown',
    dateLocale: 'fr',
    platformOrPublisher: item.category,
    source: 'Nautiljon (via RSSHub)',
    sourceUrl: item.link,
    category: 'manga',
  }
}

export async function searchMangaNautiljon(query: string): Promise<SearchResult> {
  try {
    const xml = await fetchTextViaProxy(`${RSSHUB_BASE}/nautiljon/releases/manga`)
    const items = parseRssItems(xml)
      .filter((item) => matchesSearch(item.title, query))
      .filter((item) => isFutureOrToday(parseRssDate(item.pubDate)))
      .slice(0, 20)
      .map(mapNautiljonItem)
    return {
      items,
      warning: items.length === 0 ? ui.warnings.nautiljonEmpty : ui.warnings.nautiljonFrDates,
    }
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'unknown error'
    return { items: [], warning: ui.warnings.nautiljonUnavailable(detail) }
  }
}

export async function searchManga(query: string): Promise<SearchResult> {
  const [anilist, nautiljon] = await Promise.all([
    searchMangaAniList(query),
    searchMangaNautiljon(query),
  ])
  const nautiljonTitles = new Set(nautiljon.items.map((i) => i.title.toLowerCase()))
  const items = [
    ...nautiljon.items,
    ...anilist.items.filter((i) => !nautiljonTitles.has(i.title.toLowerCase())),
  ]
  return {
    items,
    warning: [nautiljon.warning, anilist.warning].filter(Boolean).join(' ') || undefined,
  }
}
