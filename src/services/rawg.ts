import { getUi } from '../i18n'
import type { ReleaseItem, SearchResult } from '../types'
import { getUpcomingDateRange } from '../utils/calendar-months'
import { formatDisplayDate, isPastRelease, normalizeSearchTerm } from '../utils/dates'
import { fetchJsonViaProxy, fetchWithCorsFallback } from './cors-proxy'

interface RawgNamedEntity {
  name: string
}

interface RawgGame {
  id: number
  name: string
  released: string | null
  background_image: string | null
  genres?: RawgNamedEntity[]
  platforms?: Array<{ platform: { name: string } }>
  slug: string
  tba?: boolean
  score?: string
}

interface RawgGameDetail {
  developers?: RawgNamedEntity[]
  publishers?: RawgNamedEntity[]
}

interface RawgSearchResponse {
  results: RawgGame[]
}

interface RawgListResponse {
  count: number
  next: string | null
  results: RawgGame[]
}

function joinNames(items?: RawgNamedEntity[], limit = 2): string | undefined {
  const names = items?.map((item) => item.name).filter(Boolean).slice(0, limit)
  return names?.length ? names.join(', ') : undefined
}

function computeTitleMatchScore(title: string, query: string): number {
  const terms = normalizeSearchTerm(query).split(/\s+/).filter(Boolean)
  if (terms.length === 0) return 0

  const normalizedTitle = normalizeSearchTerm(title)
  const matchedTerms = terms.filter((term) => normalizedTitle.includes(term))
  const matchRatio = matchedTerms.length / terms.length

  let score = matchedTerms.length * 120

  if (matchRatio === 1) {
    score += 400
  }

  const normalizedQuery = terms.join(' ')
  if (normalizedTitle.includes(normalizedQuery)) {
    score += 250
  }

  const firstTerm = terms[0]
  if (firstTerm && normalizedTitle.startsWith(firstTerm)) {
    score += 80
  }

  for (const term of matchedTerms) {
    const wordPattern = new RegExp(`(^|[^a-z0-9])${term}([^a-z0-9]|$)`)
    if (wordPattern.test(normalizedTitle)) {
      score += 40
    }
  }

  return score
}

function computeReleaseDateScore(game: RawgGame): number {
  if (game.tba || !game.released) {
    return 350
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const release = new Date(game.released)
  if (Number.isNaN(release.getTime())) {
    return 200
  }
  release.setHours(0, 0, 0, 0)

  const diffDays = Math.floor((release.getTime() - today.getTime()) / 86_400_000)

  if (diffDays >= 0) {
    if (diffDays <= 180) return 500 - diffDays * 0.8
    if (diffDays <= 730) return 320 - diffDays * 0.15
    return Math.max(80, 180 - diffDays * 0.05)
  }

  const daysSince = Math.abs(diffDays)
  if (daysSince <= 30) return -50
  if (daysSince <= 365) return -120 - daysSince * 0.2
  return -250 - Math.min(daysSince, 5_000) * 0.08
}

function rankRawgGames(games: RawgGame[], query: string): RawgGame[] {
  return [...games].sort((a, b) => {
    const rawgScoreA = (Number.parseFloat(a.score ?? '0') || 0) * 5
    const rawgScoreB = (Number.parseFloat(b.score ?? '0') || 0) * 5

    const scoreA =
      computeTitleMatchScore(a.name, query) + computeReleaseDateScore(a) + rawgScoreA
    const scoreB =
      computeTitleMatchScore(b.name, query) + computeReleaseDateScore(b) + rawgScoreB

    if (scoreB !== scoreA) return scoreB - scoreA

    const dateA = a.released ? new Date(a.released).getTime() : Number.MAX_SAFE_INTEGER
    const dateB = b.released ? new Date(b.released).getTime() : Number.MAX_SAFE_INTEGER
    return dateA - dateB
  })
}

function mapRawgGame(game: RawgGame, detail?: RawgGameDetail | null): ReleaseItem {
  const ui = getUi()
  const platforms = game.platforms?.map((p) => p.platform.name).slice(0, 4).join(', ')
  const genres = game.genres?.map((g) => g.name).filter(Boolean).slice(0, 4)

  return {
    id: `rawg-${game.id}`,
    title: game.name,
    releaseDate: game.released ?? undefined,
    releaseDateLabel: game.released ? formatDisplayDate(game.released) : ui.dates.tba,
    dateCertainty: game.tba || !game.released ? 'unknown' : 'confirmed',
    isReleased: game.released ? isPastRelease(game.released) : undefined,
    platformOrPublisher: platforms || undefined,
    genres: genres?.length ? genres : undefined,
    developer: joinNames(detail?.developers),
    publisher: joinNames(detail?.publishers),
    imageUrl: game.background_image ?? undefined,
    source: 'RAWG',
    sourceUrl: `https://rawg.io/games/${game.slug}`,
    category: 'games',
  }
}

async function fetchRawgJson<T>(url: string): Promise<T> {
  try {
    const response = await fetchWithCorsFallback(url)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return (await response.json()) as T
  } catch {
    return fetchJsonViaProxy<T>(url)
  }
}

async function fetchGameDetail(gameId: number, apiKey: string): Promise<RawgGameDetail | null> {
  try {
    return await fetchRawgJson<RawgGameDetail>(
      `https://api.rawg.io/api/games/${gameId}?key=${apiKey}`,
    )
  } catch {
    return null
  }
}

async function mapInBatches<T, R>(
  items: T[],
  mapper: (item: T, index: number) => Promise<R>,
  batchSize = 4,
): Promise<R[]> {
  const results: R[] = []
  for (let index = 0; index < items.length; index += batchSize) {
    const batch = items.slice(index, index + batchSize)
    const batchResults = await Promise.all(batch.map((item, offset) => mapper(item, index + offset)))
    results.push(...batchResults)
  }
  return results
}

const UPCOMING_CACHE_TTL_MS = 60 * 60 * 1000
const upcomingCache = new Map<string, { expiresAt: number; value: SearchResult }>()
const upcomingInFlight = new Map<string, Promise<SearchResult>>()

async function fetchUpcomingGamesFromApi(
  apiKey: string,
  start: string,
  end: string,
): Promise<SearchResult> {
  const ui = getUi()
  const games: RawgGame[] = []
  let page = 1

  while (page <= 5) {
    const url =
      `https://api.rawg.io/api/games?dates=${start},${end}` +
      `&ordering=release&key=${apiKey}&page_size=40&page=${page}`

    const data = await fetchRawgJson<RawgListResponse>(url)
    games.push(...data.results.filter((game) => game.released && !game.tba))

    if (!data.next) break
    page += 1
  }

  const seen = new Set<number>()
  const unique = games.filter((game) => {
    if (seen.has(game.id)) return false
    seen.add(game.id)
    return true
  })

  unique.sort((a, b) => (a.released ?? '').localeCompare(b.released ?? ''))

  return {
    items: unique.map((game) => mapRawgGame(game)),
    warning: unique.length > 0 ? undefined : ui.warnings.gamesCalendarEmpty,
  }
}

export async function searchGames(query: string): Promise<SearchResult> {
  const apiKey = import.meta.env.VITE_RAWG_API_KEY
  const ui = getUi()
  if (!apiKey) {
    return { items: [], warning: ui.warnings.rawgMissing }
  }

  const searchUrl = `https://api.rawg.io/api/games?search=${encodeURIComponent(query)}&search_precise=true&key=${apiKey}&page_size=20`

  try {
    const data = await fetchRawgJson<RawgSearchResponse>(searchUrl)
    const rankedResults = rankRawgGames(data.results, query)
    const details = await mapInBatches(rankedResults, (game) => fetchGameDetail(game.id, apiKey))
    return { items: rankedResults.map((game, index) => mapRawgGame(game, details[index])) }
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'unknown error'
    return { items: [], warning: ui.warnings.rawgUnavailable(detail) }
  }
}

export async function fetchUpcomingGames(): Promise<SearchResult> {
  const apiKey = import.meta.env.VITE_RAWG_API_KEY
  const ui = getUi()
  if (!apiKey) {
    return { items: [], warning: ui.warnings.rawgMissing }
  }

  const { start, end } = getUpcomingDateRange()
  const cacheKey = `${start}:${end}`

  const cached = upcomingCache.get(cacheKey)
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value
  }

  const pending = upcomingInFlight.get(cacheKey)
  if (pending) return pending

  const promise = fetchUpcomingGamesFromApi(apiKey, start, end)
    .then((result) => {
      upcomingCache.set(cacheKey, {
        expiresAt: Date.now() + UPCOMING_CACHE_TTL_MS,
        value: result,
      })
      return result
    })
    .catch((error) => {
      const detail = error instanceof Error ? error.message : 'unknown error'
      return { items: [], warning: ui.warnings.rawgUnavailable(detail) }
    })
    .finally(() => {
      upcomingInFlight.delete(cacheKey)
    })

  upcomingInFlight.set(cacheKey, promise)
  return promise
}
