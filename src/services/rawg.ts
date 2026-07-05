import { getUi } from '../i18n'
import type { ReleaseItem, SearchResult } from '../types'
import { formatDisplayDate } from '../utils/dates'
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
  rating?: number
  ratings_count?: number
  added?: number
}

interface RawgGameDetail {
  developers?: RawgNamedEntity[]
  publishers?: RawgNamedEntity[]
}

interface RawgSearchResponse {
  results: RawgGame[]
}

function joinNames(items?: RawgNamedEntity[], limit = 2): string | undefined {
  const names = items?.map((item) => item.name).filter(Boolean).slice(0, limit)
  return names?.length ? names.join(', ') : undefined
}

/** Combine le score textuel RAWG avec rating, nb d'avis et listes utilisateurs. */
function computeRelevanceScore(game: RawgGame): number {
  const searchScore = Number.parseFloat(game.score ?? '0') || 0
  const rating = game.rating ?? 0
  const ratingsCount = game.ratings_count ?? 0
  const added = game.added ?? 0

  const popularityBoost = rating * Math.log10(ratingsCount + 1) * 10
  const addedBoost = Math.log10(added + 1) * 8
  const obscurityPenalty = ratingsCount === 0 && added < 20 ? -20 : 0

  return searchScore + popularityBoost + addedBoost + obscurityPenalty
}

function sortByRelevance(games: RawgGame[]): RawgGame[] {
  return [...games].sort((a, b) => computeRelevanceScore(b) - computeRelevanceScore(a))
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
    dateLocale: 'en',
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

export async function searchGames(query: string): Promise<SearchResult> {
  const apiKey = import.meta.env.VITE_RAWG_API_KEY
  const ui = getUi()
  if (!apiKey) {
    return { items: [], warning: ui.warnings.rawgMissing }
  }

  const searchUrl = `https://api.rawg.io/api/games?search=${encodeURIComponent(query)}&search_precise=true&key=${apiKey}&page_size=20`

  try {
    const data = await fetchRawgJson<RawgSearchResponse>(searchUrl)
    const rankedResults = sortByRelevance(data.results)
    const details = await Promise.all(
      rankedResults.map((game) => fetchGameDetail(game.id, apiKey)),
    )
    return { items: rankedResults.map((game, index) => mapRawgGame(game, details[index])) }
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'unknown error'
    return { items: [], warning: ui.warnings.rawgUnavailable(detail) }
  }
}
