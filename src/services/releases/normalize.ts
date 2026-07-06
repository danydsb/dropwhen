import { getUi } from '../../i18n'
import type { ReleaseItem } from '../../types'
import { formatDisplayDate, isPastRelease, matchesSearch } from '../../utils/dates'
import type { OpenLibraryItem } from '../open-library/types'
import type { UrbanComicsItem } from '../urban-comics/types'
import type { UnifiedRelease } from './types'

const SOURCE_LABELS = {
  urbancomics: 'Urban Comics',
  openlibrary: 'Open Library',
} as const

export function fromUrbanComics(item: UrbanComicsItem): UnifiedRelease {
  return {
    title: item.title,
    type: 'comic',
    series: item.series,
    volume: item.volume || undefined,
    publisher: item.publisher,
    release_date: item.release_date || undefined,
    date_certainty: item.release_date ? 'confirmed' : 'unknown',
    cover_url: item.cover_url || undefined,
    source_url: item.source_url,
    source: 'urbancomics',
  }
}

export function fromOpenLibrary(item: OpenLibraryItem): UnifiedRelease {
  return {
    title: item.title,
    type: 'comic',
    publisher: item.publisher,
    authors: item.authors,
    release_date: item.release_date,
    date_certainty: item.date_certainty,
    cover_url: item.cover_url,
    source_url: item.source_url,
    source: 'openlibrary',
  }
}

export function matchesRelease(release: UnifiedRelease, query: string): boolean {
  const haystack = [
    release.title,
    release.series,
    release.publisher,
    ...(release.authors ?? []),
  ]
    .filter(Boolean)
    .join(' ')
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
    dateCertainty: release.date_certainty ?? (release.release_date ? 'confirmed' : 'unknown'),
    isReleased: release.release_date ? isPastRelease(release.release_date) : undefined,
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
