import { getUi } from '../../i18n'
import type { ReleaseItem } from '../../types'
import { formatDisplayDate, matchesSearch } from '../../utils/dates'
import type { UrbanComicsItem } from '../urban-comics/types'
import type { UnifiedRelease } from './types'

const SOURCE_LABELS = {
  urbancomics: 'Urban Comics',
} as const

export function fromUrbanComics(item: UrbanComicsItem): UnifiedRelease {
  return {
    title: item.title,
    type: 'comic',
    series: item.series,
    volume: item.volume || undefined,
    publisher: item.publisher,
    release_date: item.release_date || undefined,
    cover_url: item.cover_url || undefined,
    source_url: item.source_url,
    source: 'urbancomics',
  }
}

export function matchesRelease(release: UnifiedRelease, query: string): boolean {
  const haystack = [release.title, release.series, release.publisher].filter(Boolean).join(' ')
  return matchesSearch(haystack, query)
}

export function toReleaseItem(release: UnifiedRelease): ReleaseItem {
  const ui = getUi()

  return {
    id: `${release.source}-${release.source_url ?? release.title}-${release.release_date ?? 'unknown'}`,
    title: release.title,
    releaseDate: release.release_date,
    releaseDateLabel: release.release_date
      ? formatDisplayDate(release.release_date)
      : ui.dates.toConfirm,
    dateCertainty: release.release_date ? 'confirmed' : 'unknown',
    platformOrPublisher: release.publisher,
    developer: release.authors?.join(', ') || undefined,
    publisher: release.publisher,
    imageUrl: release.cover_url,
    source: SOURCE_LABELS[release.source],
    sourceUrl: release.source_url,
    category: 'comics',
  }
}

export function dedupeReleases(items: UnifiedRelease[]): UnifiedRelease[] {
  const seen = new Map<string, UnifiedRelease>()

  for (const item of items) {
    const key = `${item.title.toLowerCase()}|${item.release_date ?? ''}|${item.publisher ?? ''}`
    if (!seen.has(key)) seen.set(key, item)
  }

  return [...seen.values()]
}
