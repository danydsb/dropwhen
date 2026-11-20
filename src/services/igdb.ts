import { getUi } from '../i18n'
import type { ReleaseItem, SearchResult } from '../types'
import { getUpcomingDateRange } from '../utils/calendar-months'
import { getIntlLocale, getLocale } from '../i18n'
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

interface IgdbGameReleaseDate {
  date?: number
  /** 0 = exact day, 1 = month, 2 = year, 3-6 = Q1-Q4, 7 = TBD */
  date_format?: number
  /** Release status id (3 = Early Access, 6 = Full Release…) */
  status?: number
}

interface IgdbWebsite {
  url?: string
  type?: number
}

interface IgdbGame {
  id: number
  parent_game?: { id: number }
  hypes?: number
  summary?: string
  screenshots?: IgdbArtwork[]
  videos?: Array<{ video_id?: string }>
  websites?: IgdbWebsite[]
  release_dates?: IgdbGameReleaseDate[]
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

/**
 * Minimum IGDB "hypes" (follows before release) for a game to appear in the
 * upcoming calendar. Filters out the long tail of tiny indies/shovelware while
 * keeping AAA, AA and anticipated indies (Witchbrook, Pony Island 2…).
 */
const UPCOMING_MIN_HYPES = 10

/**
 * Excludes adult titles (suggestive visual novels…): IGDB theme "Erotic" (42)
 * and the "nsfw" (2509) / "eroge" (847) keywords. Age-rating descriptors are
 * deliberately not used: they would also drop GTA VI, Fable, Persona…
 */
const ADULT_CONTENT_FILTER = 'themes != (42) & keywords != (2509,847)'

const IGDB_WEBSITE_TYPE_STEAM = 13
const IGDB_STATUS_EARLY_ACCESS = 3
const IGDB_STATUS_FULL_RELEASE = 6
const MAX_GALLERY_IMAGES = 12

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

function toImageUrl(item: IgdbArtwork, size: string): string | undefined {
  if (item.image_id) return `https://images.igdb.com/igdb/image/upload/${size}/${item.image_id}.jpg`
  if (!item.url) return undefined
  const url = item.url.startsWith('//') ? `https:${item.url}` : item.url
  return url.replace(/\/t_[a-z0-9_]+\//, `/${size}/`)
}

function getGalleryUrls(game: IgdbGame): string[] {
  return [...(game.screenshots ?? []), ...(game.artworks ?? [])]
    .map((item) => toImageUrl(item, 't_1080p'))
    .filter((url): url is string => Boolean(url))
    .slice(0, MAX_GALLERY_IMAGES)
}

function getSteamUrl(game: IgdbGame): string | undefined {
  return game.websites?.find(
    (site) => site.type === IGDB_WEBSITE_TYPE_STEAM || site.url?.includes('store.steampowered.com'),
  )?.url
}

function getTrailerUrl(game: IgdbGame): string | undefined {
  const videoId = game.videos?.find((video) => video.video_id)?.video_id
  return videoId ? `https://www.youtube.com/watch?v=${videoId}` : undefined
}

function toIsoDate(timestampSeconds?: number): string | undefined {
  if (!timestampSeconds) return undefined
  const date = new Date(timestampSeconds * 1000)
  if (Number.isNaN(date.getTime())) return undefined
  return date.toISOString().slice(0, 10)
}

const IGDB_DATE_FORMAT_EXACT = 0
const IGDB_DATE_FORMAT_MONTH = 1
const IGDB_DATE_FORMAT_YEAR = 2
const IGDB_DATE_FORMAT_Q1 = 3
const IGDB_DATE_FORMAT_Q4 = 6

function getFirstReleaseDateFormat(game: IgdbGame): number {
  const match = game.release_dates?.find((item) => item.date === game.first_release_date)
  return match?.date_format ?? IGDB_DATE_FORMAT_EXACT
}

function formatApproximateDate(timestampSeconds: number, dateFormat: number): string | undefined {
  const date = new Date(timestampSeconds * 1000)
  const year = date.getUTCFullYear()

  if (dateFormat === IGDB_DATE_FORMAT_MONTH) {
    const label = new Intl.DateTimeFormat(getIntlLocale(getLocale()), {
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(date)
    return label.charAt(0).toUpperCase() + label.slice(1)
  }
  if (dateFormat === IGDB_DATE_FORMAT_YEAR) return String(year)
  if (dateFormat >= IGDB_DATE_FORMAT_Q1 && dateFormat <= IGDB_DATE_FORMAT_Q4) {
    const quarter = dateFormat - IGDB_DATE_FORMAT_Q1 + 1
    return getLocale() === 'fr' ? `T${quarter} ${year}` : `Q${quarter} ${year}`
  }
  return undefined
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
  const dateFormat = getFirstReleaseDateFormat(game)
  const approximateLabel =
    game.first_release_date && dateFormat !== IGDB_DATE_FORMAT_EXACT
      ? formatApproximateDate(game.first_release_date, dateFormat)
      : undefined

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
    releaseDateLabel: approximateLabel ?? (releaseDate ? formatDisplayDate(releaseDate) : ui.dates.tba),
    dateCertainty: !releaseDate ? 'unknown' : approximateLabel ? 'estimated' : 'confirmed',
    isReleased: releaseDate ? isPastRelease(releaseDate) : undefined,
    platformOrPublisher: joinNames(game.platforms?.map((platform) => platform.name) ?? [], 4),
    genres: game.genres?.map((genre) => genre.name).slice(0, 4),
    developer: joinNames(developerNames),
    publisher: joinNames(publisherNames),
    imageUrl: getImageUrl(game.cover) ?? getArtworkUrl(game.artworks),
    gameTypeLabel: getGameTypeLabel(game),
    gameTypeId: getGameTypeId(game),
    images: getGalleryUrls(game),
    artworkUrl: game.artworks?.[0] ? toImageUrl(game.artworks[0], 't_1080p') : undefined,
    summary: game.summary,
    trailerUrl: getTrailerUrl(game),
    steamUrl: getSteamUrl(game),
    hypes: game.hypes,
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

const GAME_FIELDS =
  'name,slug,hypes,summary,screenshots.image_id,videos.video_id,websites.url,websites.type,first_release_date,release_dates.date,release_dates.date_format,release_dates.status,game_type.id,game_type.type,cover.image_id,cover.url,cover.width,cover.height,artworks.image_id,artworks.url,artworks.width,artworks.height,genres.name,platforms.name,involved_companies.developer,involved_companies.porting,involved_companies.supporting,involved_companies.publisher,involved_companies.company.name'

const UPCOMING_CACHE_TTL_MS = 60 * 60 * 1000
const upcomingCache = new Map<string, { expiresAt: number; value: SearchResult }>()
const upcomingInFlight = new Map<string, Promise<SearchResult>>()

export async function searchGames(query: string): Promise<SearchResult> {
  const request = [
    `search "${query.replaceAll('"', '\\"')}";`,
    `fields ${GAME_FIELDS};`,
    `where version_parent = null & ${ADULT_CONTENT_FILTER};`,
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

  // Query games directly (not release_dates): a 500-row release_dates page only
  // covered a few days, and the hype filter has to run server-side.
  const query = [
    `fields ${GAME_FIELDS};`,
    `where first_release_date >= ${startTimestamp} & first_release_date <= ${endTimestamp} & version_parent = null & hypes >= ${UPCOMING_MIN_HYPES} & ${ADULT_CONTENT_FILTER};`,
    'sort first_release_date asc;',
    'limit 500;',
  ].join(' ')

  // Early-access games reaching 1.0 inside the window (e.g. Path of Exile 2): their
  // first_release_date is years old, so they only show up through release_dates.
  const fullReleaseQuery = [
    `fields date,date_format,${GAME_FIELDS.split(',').map((field) => `game.${field}`).join(',')};`,
    `where status = ${IGDB_STATUS_FULL_RELEASE} & date >= ${startTimestamp} & date <= ${endTimestamp} & date_format = (0,1) & game.first_release_date < ${startTimestamp} & game.game_type = ${IGDB_MAIN_GAME_TYPE_ID} & game.version_parent = null & game.hypes >= ${UPCOMING_MIN_HYPES} & ${ADULT_CONTENT_FILTER.replace(/(themes|keywords)/g, 'game.$1')};`,
    'sort date asc;',
    'limit 100;',
  ].join(' ')

  const [games, fullReleases] = await Promise.all([
    igdbPost<IgdbGame[]>('games', query),
    igdbPost<Array<{ date?: number; game?: IgdbGame }>>('release_dates', fullReleaseQuery).catch(() => []),
  ])

  const byId = new Map(games.map((game) => [game.id, mapIgdbGame(game)]))
  for (const release of fullReleases) {
    if (!release.game || !release.date || byId.has(release.game.id)) continue
    // Only games coming out of early access — not ports / new platforms of released games.
    const wasEarlyAccess = release.game.release_dates?.some(
      (item) => item.status === IGDB_STATUS_EARLY_ACCESS,
    )
    if (!wasEarlyAccess) continue
    byId.set(release.game.id, {
      ...mapIgdbGame({ ...release.game, first_release_date: release.date }),
      gameTypeLabel: ui.mag.fullRelease,
    })
  }
  const unique = [...byId.values()].sort((a, b) =>
    (a.releaseDate ?? '9999').localeCompare(b.releaseDate ?? '9999'),
  )

  return {
    items: unique,
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

/**
 * IGDB game_type ids treated as "content": DLC, expansion, standalone expansion, pack.
 * Seasons / updates are left out on purpose: they come from official publisher pages.
 */
export const IGDB_CONTENT_GAME_TYPES = [1, 2, 4, 13] as const

export interface IgdbContentItem {
  parentIgdbId: number
  gameTypeId?: number
  item: ReleaseItem
}

/**
 * DLC / seasons / expansions of the given base games released between two
 * timestamps, plus the base games themselves (covers and visuals as fallback).
 */
export async function fetchIgdbContent(
  parentIds: number[],
  startTimestamp: number,
  endTimestamp: number,
): Promise<{
  children: IgdbContentItem[]
  parents: Map<number, ReleaseItem>
}> {
  const ids = parentIds.join(',')
  const [children, parents] = await Promise.all([
    igdbPost<IgdbGame[]>(
      'games',
      [
        `fields ${GAME_FIELDS},parent_game.id;`,
        `where parent_game = (${ids}) & game_type = (${IGDB_CONTENT_GAME_TYPES.join(',')}) & first_release_date >= ${startTimestamp} & first_release_date <= ${endTimestamp};`,
        'sort first_release_date asc;',
        'limit 300;',
      ].join(' '),
    ),
    igdbPost<IgdbGame[]>('games', `fields ${GAME_FIELDS}; where id = (${ids}); limit ${parentIds.length};`),
  ])

  return {
    children: children
      .filter((game) => game.parent_game?.id)
      .map((game) => ({
        parentIgdbId: game.parent_game!.id,
        gameTypeId: game.game_type?.id,
        item: mapIgdbGame(game),
      })),
    parents: new Map(parents.map((game) => [game.id, mapIgdbGame(game)])),
  }
}
