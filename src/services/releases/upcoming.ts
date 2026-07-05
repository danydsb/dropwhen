import { getUi } from '../../i18n'
import type { SearchResult } from '../../types'
import { isFutureOrToday, normalizeSearchTerm } from '../../utils/dates'
import { searchUrbanComics } from '../urban-comics'
import { dedupeReleases, fromUrbanComics, matchesRelease, toReleaseItem } from './normalize'
import type { UnifiedRelease } from './types'

function sortByDate(items: UnifiedRelease[]): UnifiedRelease[] {
  return [...items].sort((a, b) => {
    if (!a.release_date && !b.release_date) return 0
    if (!a.release_date) return 1
    if (!b.release_date) return -1
    return a.release_date.localeCompare(b.release_date)
  })
}

function filterComicReleases(items: UnifiedRelease[], query: string): UnifiedRelease[] {
  const filtered = items
    .filter((item) => matchesRelease(item, query))
    .filter((item) => item.release_date && isFutureOrToday(item.release_date))

  return sortByDate(dedupeReleases(filtered))
}

export async function searchComics(query: string): Promise<SearchResult> {
  const ui = getUi()

  try {
    const feed = await searchUrbanComics(query)
    const mapped = feed.items.map(fromUrbanComics)
    const releaseItems = filterComicReleases(mapped, query)
      .slice(0, 20)
      .map((item) => toReleaseItem(item))

    return {
      items: releaseItems,
      warning:
        releaseItems.length > 0
          ? ui.warnings.upcomingComicsOk(['Urban Comics'])
          : ui.warnings.upcomingComicsEmpty,
    }
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'unknown error'
    return { items: [], warning: ui.warnings.upcomingComicsUnavailable(detail) }
  }
}

export function upcomingDedupeKey(release: UnifiedRelease): string {
  return `${normalizeSearchTerm(release.title)}|${release.release_date ?? ''}|${release.publisher ?? ''}`
}
