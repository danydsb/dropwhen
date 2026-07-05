import { ui } from '../i18n'
import type { ReleaseItem, SearchResult } from '../types'
import { formatDisplayDate } from '../utils/dates'
import { fetchJsonViaProxy, fetchWithCorsFallback } from './cors-proxy'

interface RawgGame {
  id: number
  name: string
  released: string | null
  platforms?: Array<{ platform: { name: string } }>
  slug: string
  tba?: boolean
}

interface RawgSearchResponse {
  results: RawgGame[]
}

function mapRawgGame(game: RawgGame): ReleaseItem {
  const platforms = game.platforms?.map((p) => p.platform.name).slice(0, 4).join(', ')
  return {
    id: `rawg-${game.id}`,
    title: game.name,
    releaseDate: game.released ?? undefined,
    releaseDateLabel: game.released ? formatDisplayDate(game.released) : ui.dates.tba,
    dateCertainty: game.tba || !game.released ? 'unknown' : 'confirmed',
    dateLocale: 'en',
    platformOrPublisher: platforms || undefined,
    source: 'RAWG',
    sourceUrl: `https://rawg.io/games/${game.slug}`,
    category: 'games',
  }
}

export async function searchGames(query: string): Promise<SearchResult> {
  const apiKey = import.meta.env.VITE_RAWG_API_KEY
  if (!apiKey) {
    return { items: [], warning: ui.warnings.rawgMissing }
  }

  const url = `https://api.rawg.io/api/games?search=${encodeURIComponent(query)}&key=${apiKey}&page_size=20`

  try {
    let data: RawgSearchResponse
    try {
      const response = await fetchWithCorsFallback(url)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      data = (await response.json()) as RawgSearchResponse
    } catch {
      data = await fetchJsonViaProxy<RawgSearchResponse>(url)
    }
    return { items: data.results.map(mapRawgGame) }
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'unknown error'
    return { items: [], warning: ui.warnings.rawgUnavailable(detail) }
  }
}
