import { getUi } from '../../i18n'
import type { SearchResult } from '../../types'
import { isFutureOrToday, normalizeSearchTerm } from '../../utils/dates'
import { searchOpenLibrary } from '../open-library'
import { searchUrbanComics } from '../urban-comics'
import {
  dedupeReleases,
  fromOpenLibrary,
  fromUrbanComics,
  matchesRelease,
  toReleaseItem,
} from './normalize'
import type { UnifiedRelease } from './types'

const SOURCE_LABELS = {
  urbancomics: 'Urban Comics',
  openlibrary: 'Open Library',
} as const

function sortComicResults(items: UnifiedRelease[]): UnifiedRelease[] {
  const upcoming: UnifiedRelease[] = []
  const past: UnifiedRelease[] = []
  const undated: UnifiedRelease[] = []

  for (const item of items) {
    if (!item.release_date) undated.push(item)
    else if (isFutureOrToday(item.release_date)) upcoming.push(item)
    else past.push(item)
  }

  upcoming.sort((a, b) => (a.release_date ?? '').localeCompare(b.release_date ?? ''))
  past.sort((a, b) => (b.release_date ?? '').localeCompare(a.release_date ?? ''))

  return [...upcoming, ...past, ...undated]
}

function filterComicReleases(items: UnifiedRelease[], query: string): UnifiedRelease[] {
  const filtered = items.filter((item) => matchesRelease(item, query))
  return sortComicResults(dedupeReleases(filtered))
}

function collectSources(items: UnifiedRelease[]): string[] {
  const labels = new Set<string>()
  for (const item of items) {
    labels.add(SOURCE_LABELS[item.source])
  }
  return [...labels]
}

export async function searchComics(query: string): Promise<SearchResult> {
  const ui = getUi()

  const [urbanResult, openLibraryResult] = await Promise.allSettled([
    searchUrbanComics(query),
    searchOpenLibrary(query),
  ])

  const mapped: UnifiedRelease[] = []

  if (urbanResult.status === 'fulfilled') {
    mapped.push(...urbanResult.value.items.map(fromUrbanComics))
  }

  if (openLibraryResult.status === 'fulfilled') {
    mapped.push(...openLibraryResult.value.items.map(fromOpenLibrary))
  }

  const filtered = filterComicReleases(mapped, query)
  const releaseItems = filtered.slice(0, 20).map((item) => toReleaseItem(item))

  if (releaseItems.length > 0) {
    return {
      items: releaseItems,
      warning: ui.warnings.comicsOk(collectSources(filtered.slice(0, 20))),
    }
  }

  const errors = [urbanResult, openLibraryResult]
    .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
    .map((result) => (result.reason instanceof Error ? result.reason.message : 'unknown error'))

  if (errors.length === 2) {
    return { items: [], warning: ui.warnings.upcomingComicsUnavailable(errors.join(' ; ')) }
  }

  return { items: [], warning: ui.warnings.comicsEmpty }
}

export function upcomingDedupeKey(release: UnifiedRelease): string {
  return `${normalizeSearchTerm(release.title)}|${release.release_date ?? ''}|${release.publisher ?? ''}`
}
