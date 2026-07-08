import { getUi } from '../i18n'
import type { ReleaseItem, SearchResult } from '../types'
import { getUpcomingDateRange } from '../utils/calendar-months'
import { formatDisplayDate, isPastRelease, normalizeSearchTerm } from '../utils/dates'

interface IgdbNamedEntity {
  id: number
  name: string
}

interface IgdbCover {
  image_id?: string
  url?: string
  width?: number
  height?: number
}

interface IgdbInvolvedCompany {
  developer?: boolean
  publisher?: boolean
  porting?: boolean
  supporting?: boolean
  company?: IgdbNamedEntity
}

interface IgdbArtwork {
  image_id?: string
  url?: string
  width?: number
  height?: number
}

interface IgdbGameType {
  id: number
  type?: string
}

interface IgdbGame {
  id: number
  name: string
  slug?: string
  first_release_date?: number
  cover?: IgdbCover
  artworks?: IgdbArtwork[]
  game_type?: IgdbGameType
  genres?: IgdbNamedEntity[]
  platforms?: IgdbNamedEntity[]
  involved_companies?: IgdbInvolvedCompany[]
}

const IGDB_MAIN_GAME_TYPE_ID = 0

interface IgdbReleaseDate {
  id: number
  date?: number
  game?: IgdbGame
}

interface IgdbProxyError {
  error?: string
}

function getImageUrl(cover?: IgdbCover): string | undefined {
  if (!cover) return undefined
  if (cover.image_id) {
    return `https://images.igdb.com/igdb/image/upload/t_cover_big_2x/${cover.image_id}.jpg`
  }
  if (!cover.url) return undefined
  if (cover.url.startsWith('//')) return `https:${cover.url}`
  return cover.url
}

function getArtworkUrl(artworks?: IgdbArtwork[]): string | undefined {
  const artwork = artworks?.find((item) => Boolean(item.image_id || item.url))
  if (!artwork) return undefined
  if (artwork.image_id) {
    return `https://images.igdb.com/igdb/image/upload/t_720p/${artwork.image_id}.jpg`
  }
  if (!artwork.url) return undefined
  if (artwork.url.startsWith('//')) return `https:${artwork.url}`
  return artwork.url
}

function getAspectRatio(game: IgdbGame): number | undefined {
  if (game.cover?.width && game.cover?.height) {
    const ratio = game.cover.width / game.cover.height
    if (Number.isFinite(ratio) && ratio > 0) return ratio
  }

  const artworkWithDimensions = game.artworks?.find((a) => a.width && a.height)
  if (artworkWithDimensions?.width && artworkWithDimensions?.height) {
    const ratio = artworkWithDimensions.width / artworkWithDimensions.height
    if (Number.isFinite(ratio) && ratio > 0) return ratio
  }

  return undefined
}

function toIsoDate(timestampSeconds?: number): string | undefined {
  if (!timestampSeconds) return undefined
  const date = new Date(timestampSeconds * 1000)
  if (Number.isNaN(date.getTime())) return undefined
  return date.toISOString().slice(0, 10)
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

function computeReleaseDateScore(game: IgdbGame): number {
  if (!game.first_release_date) return 300

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const release = new Date(game.first_release_date * 1000)
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

function rankIgdbGames(games: IgdbGame[], query: string): IgdbGame[] {
  return [...games].sort((a, b) => {
    const scoreA = computeTitleMatchScore(a.name, query) + computeReleaseDateScore(a)
    const scoreB = computeTitleMatchScore(b.name, query) + computeReleaseDateScore(b)

    if (scoreB !== scoreA) return scoreB - scoreA

    const dateA = a.first_release_date ? a.first_release_date * 1000 : Number.MAX_SAFE_INTEGER
    const dateB = b.first_release_date ? b.first_release_date * 1000 : Number.MAX_SAFE_INTEGER
    return dateA - dateB
  })
}

function joinNames(items: string[], limit = 2): string | undefined {
  const unique = Array.from(new Set(items.filter(Boolean))).slice(0, limit)
  return unique.length > 0 ? unique.join(', ') : undefined
}

function getGameTypeLabel(game: IgdbGame): string | undefined {
  const typeId = game.game_type?.id
  const typeName = game.game_type?.type?.trim()
  if (typeId === undefined || typeId === IGDB_MAIN_GAME_TYPE_ID || !typeName) {
    return undefined
  }
  return typeName
}

function getGameTypeId(game: IgdbGame): number | undefined {
  const typeId = game.game_type?.id
  if (typeId === undefined || typeId === IGDB_MAIN_GAME_TYPE_ID) return undefined
  return typeId
}

function mapIgdbGame(game: IgdbGame): ReleaseItem {
  const ui = getUi()
  const releaseDate = toIsoDate(game.first_release_date)
  const imageAspectRatio = getAspectRatio(game)

  const developerNames =
    game.involved_companies
      ?.filter((company) => company.developer || company.porting || company.supporting)
      .map((company) => company.company?.name ?? '') ?? []

  const publisherNames =
    game.involved_companies
      ?.filter((company) => company.publisher)
      .map((company) => company.company?.name ?? '') ?? []

  return {
    id: `igdb-${game.id}`,
    title: game.name,
    releaseDate,
    releaseDateLabel: releaseDate ? formatDisplayDate(releaseDate) : ui.dates.tba,
    dateCertainty: releaseDate ? 'confirmed' : 'unknown',
    isReleased: releaseDate ? isPastRelease(releaseDate) : undefined,
    platformOrPublisher: joinNames(game.platforms?.map((platform) => platform.name) ?? [], 4),
    genres: game.genres?.map((genre) => genre.name).slice(0, 4),
    developer: joinNames(developerNames),
    publisher: joinNames(publisherNames),
    imageUrl: getImageUrl(game.cover) ?? getArtworkUrl(game.artworks),
    imageAspectRatio,
    gameTypeLabel: getGameTypeLabel(game),
    gameTypeId: getGameTypeId(game),
    source: 'IGDB',
    sourceUrl: game.slug ? `https://www.igdb.com/games/${game.slug}` : undefined,
    category: 'games',
  }
}

async function igdbPost<T>(endpoint: string, query: string): Promise<T> {
  const response = await fetch('/api/igdb-proxy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ endpoint, query }),
  })

  if (!response.ok) {
    let detail = `HTTP ${response.status}`
    try {
      const data = (await response.json()) as IgdbProxyError
      if (data.error) detail = data.error
    } catch {
      // ignore parse failures
    }
    throw new Error(detail)
  }

  return (await response.json()) as T
}

function resolveIgdbWarning(error: unknown): string {
  const ui = getUi()
  const detail = error instanceof Error ? error.message : 'unknown error'
  const normalized = detail.toLowerCase()

  if (
    normalized.includes('credentials missing') ||
    normalized.includes('igdb_client_id') ||
    normalized.includes('igdb_client_secret') ||
    normalized.includes('missing endpoint or query')
  ) {
    return ui.warnings.rawgMissing
  }

  return ui.warnings.rawgUnavailable(detail)
}

const UPCOMING_CACHE_TTL_MS = 60 * 60 * 1000
const upcomingCache = new Map<string, { expiresAt: number; value: SearchResult }>()
const upcomingInFlight = new Map<string, Promise<SearchResult>>()

export async function searchGames(query: string): Promise<SearchResult> {
  const request = [
    `search "${query.replaceAll('"', '\\"')}";`,
    'fields name,slug,first_release_date,game_type.id,game_type.type,cover.image_id,cover.url,cover.width,cover.height,artworks.image_id,artworks.url,artworks.width,artworks.height,genres.name,platforms.name,involved_companies.developer,involved_companies.porting,involved_companies.supporting,involved_companies.publisher,involved_companies.company.name;',
    'where version_parent = null;',
    'limit 50;',
  ].join(' ')

  try {
    const data = await igdbPost<IgdbGame[]>('games', request)
    const ranked = rankIgdbGames(data, query).slice(0, 20)
    return { items: ranked.map(mapIgdbGame) }
  } catch (error) {
    return { items: [], warning: resolveIgdbWarning(error) }
  }
}

async function fetchUpcomingGamesFromApi(start: string, end: string): Promise<SearchResult> {
  const ui = getUi()
  const startTimestamp = Math.floor(new Date(`${start}T00:00:00Z`).getTime() / 1000)
  const endTimestamp = Math.floor(new Date(`${end}T23:59:59Z`).getTime() / 1000)

  const query = [
    'fields date,game.name,game.slug,game.first_release_date,game.game_type.id,game.game_type.type,game.cover.image_id,game.cover.url,game.cover.width,game.cover.height,game.artworks.image_id,game.artworks.url,game.artworks.width,game.artworks.height,game.genres.name,game.platforms.name,game.involved_companies.developer,game.involved_companies.porting,game.involved_companies.supporting,game.involved_companies.publisher,game.involved_companies.company.name;',
    `where date >= ${startTimestamp} & date <= ${endTimestamp} & game.version_parent = null;`,
    'sort date asc;',
    'limit 500;',
  ].join(' ')

  const releaseDates = await igdbPost<IgdbReleaseDate[]>('release_dates', query)

  const byGame = new Map<number, IgdbGame>()
  for (const item of releaseDates) {
    if (!item.game?.id) continue

    const existing = byGame.get(item.game.id)
    const candidateDate = item.date ?? item.game.first_release_date
    const existingDate = existing?.first_release_date

    if (!existing || (candidateDate && (!existingDate || candidateDate < existingDate))) {
      byGame.set(item.game.id, {
        ...item.game,
        first_release_date: candidateDate ?? item.game.first_release_date,
      })
    }
  }

  const unique = [...byGame.values()].sort((a, b) => {
    const dateA = a.first_release_date ?? Number.MAX_SAFE_INTEGER
    const dateB = b.first_release_date ?? Number.MAX_SAFE_INTEGER
    return dateA - dateB
  })

  return {
    items: unique.map(mapIgdbGame),
    warning: unique.length > 0 ? undefined : ui.warnings.gamesCalendarEmpty,
  }
}

export async function fetchUpcomingGames(): Promise<SearchResult> {
  const { start, end } = getUpcomingDateRange()
  const cacheKey = `${start}:${end}`

  const cached = upcomingCache.get(cacheKey)
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value
  }

  const pending = upcomingInFlight.get(cacheKey)
  if (pending) return pending

  const promise = fetchUpcomingGamesFromApi(start, end)
    .then((result) => {
      upcomingCache.set(cacheKey, {
        expiresAt: Date.now() + UPCOMING_CACHE_TTL_MS,
        value: result,
      })
      return result
    })
    .catch((error) => {
      return { items: [], warning: resolveIgdbWarning(error) }
    })
    .finally(() => {
      upcomingInFlight.delete(cacheKey)
    })

  upcomingInFlight.set(cacheKey, promise)
  return promise
}
