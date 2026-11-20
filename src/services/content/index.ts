import { getLocale, getUi } from '../../i18n'
import { MANUAL_CONTENT } from '../../data/manual-content'
import { TRACKED_GAMES, type TrackedGame } from '../../data/tracked-games'
import type { ReleaseItem } from '../../types'
import { formatDisplayDate, getTodayIso, isPastRelease } from '../../utils/dates'
import { fetchIgdbContent, type IgdbContentItem } from '../igdb'
import type { ContentFeed, ContentFeedEntry, ContentKind, ManualContentEntry } from './types'

/** How far back a released item still counts as "right now". */
const RECENT_DAYS = 45
/** A season started within this window with no known end is considered still running. */
const SEASON_RUNNING_DAYS = 120
/** How far ahead we look (items past the month sections land in "Later"). */
const LOOKAHEAD_MONTHS = 18


const IGDB_TYPE_TO_KIND: Record<number, ContentKind> = {
  1: 'dlc',
  2: 'expansion',
  4: 'expansion',
  13: 'pack',
}

const EMPTY_FEED: ContentFeed = {
  entries: [],
  links: { poe1PatchThreads: [], poe2PatchThreads: [], poe2Announcements: [] },
  errors: [],
}

export interface ContentResult {
  items: ReleaseItem[]
  /** Names of sources that failed (shown as a soft warning) */
  failedSources: string[]
}

function addDays(iso: string, days: number): string {
  const date = new Date(`${iso}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

function addMonths(iso: string, months: number): string {
  const date = new Date(`${iso}T00:00:00Z`)
  date.setUTCMonth(date.getUTCMonth() + months)
  return date.toISOString().slice(0, 10)
}

function toTimestamp(iso: string): number {
  return Math.floor(new Date(`${iso}T00:00:00Z`).getTime() / 1000)
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Riot and Blizzard serve the same articles under /fr-fr/. */
function localizeUrl(url?: string): string | undefined {
  if (!url || getLocale() !== 'fr') return url
  return /leagueoflegends\.com|news\.blizzard\.com/.test(url) ? url.replace('/en-us/', '/fr-fr/') : url
}

/**
 * "Street Fighter 6: Year 4 - Arjun" / "Street Fighter 6: Additional Character - Arjun & Outfit 2"
 * → "Arjun". Used both for display and to merge IGDB duplicates.
 */
export function cleanContentTitle(title: string, parentNames: string[]): string {
  let label = title
  for (const parent of parentNames.filter(Boolean)) {
    label = label.replace(new RegExp(`^${escapeRegExp(parent)}\\s*[:\\-–—]\\s*`, 'i'), '')
  }
  label = label
    .replace(/^(Year \d+|Additional Character|Season \d+ Pass|Character Pass)\s*[-–—:]\s*/i, '')
    .replace(/\s*&\s*Outfit[\s\S]*$/i, '')
    .replace(/\s*\([^)]*\)\s*$/, '')
    .trim()
  return label || title
}

function precision(item: ReleaseItem): number {
  if (item.dateCertainty === 'confirmed') return 2
  if (item.dateCertainty === 'estimated') return 1
  return 0
}

/** Keeps one entry per (game, label), preferring the most precise then earliest date. */
function dedupe(items: ReleaseItem[]): ReleaseItem[] {
  const byKey = new Map<string, ReleaseItem>()
  for (const item of items) {
    const key = `${item.parentTitle}|${item.title.toLowerCase()}`
    const existing = byKey.get(key)
    if (
      !existing ||
      precision(item) > precision(existing) ||
      (precision(item) === precision(existing) &&
        (item.releaseDate ?? '9999') < (existing.releaseDate ?? '9999'))
    ) {
      byKey.set(key, {
        ...item,
        imageUrl: item.imageUrl ?? existing?.imageUrl,
        images: item.images?.length ? item.images : existing?.images,
      })
    }
  }
  return [...byKey.values()]
}

function findGame(key: string): TrackedGame | undefined {
  return TRACKED_GAMES.find((game) => game.key === key)
}

function baseItem(game: TrackedGame | undefined, parents: Map<number, ReleaseItem>): Partial<ReleaseItem> {
  const parent = game?.igdbIds.map((id) => parents.get(id)).find(Boolean)
  return {
    parentTitle: game?.name,
    imageUrl: parent?.imageUrl,
    images: parent?.images,
    artworkUrl: parent?.artworkUrl,
    steamUrl: parent?.steamUrl,
    platformOrPublisher: parent?.platformOrPublisher,
  }
}

function contentItem(
  fields: Partial<ReleaseItem> & Pick<ReleaseItem, 'id' | 'title' | 'source'> & { contentKind: ContentKind },
): ReleaseItem {
  return {
    category: 'content',
    dateCertainty: fields.releaseDate ? 'confirmed' : 'unknown',
    releaseDateLabel: fields.releaseDate ? formatDisplayDate(fields.releaseDate) : undefined,
    isReleased: fields.releaseDate ? isPastRelease(fields.releaseDate) : undefined,
    gameTypeLabel: getUi().content.kinds[fields.contentKind],
    ...fields,
  }
}

/** Patch notes / official article for content IGDB knows about but does not link. */
function findNotesUrl(gameKey: string, title: string, feed: ContentFeed): string | undefined {
  if (gameKey === 'poe') {
    const name = title.toLowerCase()
    return feed.links.poe1PatchThreads.find(
      (thread) => /content update/i.test(thread.title) && thread.title.toLowerCase().includes(name),
    )?.url
  }
  if (gameKey === 'd4') return localizeUrl(feed.links.d4PatchNotes)
  if (gameKey === 'wow') return localizeUrl(feed.links.wowPatchNotes)
  return undefined
}

function fromIgdb(
  entry: IgdbContentItem,
  parents: Map<number, ReleaseItem>,
  feed: ContentFeed,
): ReleaseItem | undefined {
  const ui = getUi()
  const game = TRACKED_GAMES.find((tracked) => tracked.igdbIds.includes(entry.parentIgdbId))
  if (!game) return undefined
  const parent = parents.get(entry.parentIgdbId)
  const kind = IGDB_TYPE_TO_KIND[entry.gameTypeId ?? -1] ?? 'dlc'
  const title = cleanContentTitle(entry.item.title, [game.name, parent?.title ?? ''])

  // IGDB contributors often store "sometime this year" as an exact December 31st.
  const yearPlaceholder =
    entry.item.dateCertainty === 'confirmed' && entry.item.releaseDate?.endsWith('-12-31')

  return {
    ...entry.item,
    id: `content-${entry.item.id}`,
    category: 'content',
    title,
    parentTitle: game.name,
    contentKind: kind,
    gameTypeLabel: ui.content.kinds[kind],
    gameTypeId: undefined,
    ...(yearPlaceholder
      ? {
          dateCertainty: 'estimated' as const,
          releaseDateLabel: ui.content.endOfYear(entry.item.releaseDate!.slice(0, 4)),
        }
      : {}),
    imageUrl: entry.item.imageUrl ?? parent?.imageUrl,
    images: entry.item.images?.length ? entry.item.images : parent?.images,
    artworkUrl: entry.item.artworkUrl ?? parent?.artworkUrl,
    steamUrl: entry.item.steamUrl ?? parent?.steamUrl,
    notesUrl: findNotesUrl(game.key, title, feed),
  }
}

const SOURCE_NAMES: Record<ContentFeedEntry['source'], string> = {
  riot: 'Riot Games',
  tft: 'Riot Games',
  blizzard: 'Blizzard',
  ggg: 'Grinding Gear Games',
}

function feedTitle(entry: ContentFeedEntry): string {
  const ui = getUi()
  if (entry.kind === 'patch' && entry.number) return ui.content.patch(entry.number)
  if (entry.kind === 'set' && entry.number) return ui.content.tftSet(entry.number, entry.name)
  if (entry.kind === 'launch' && entry.gameKey === 'poe2') return ui.content.poe2Launch(entry.name)
  if (entry.kind === 'season' && entry.number && /^Season \d+$/i.test(entry.title)) {
    return ui.content.season(entry.number)
  }
  return entry.title
}

/** Direct patch notes / official article for an entry of the official feed. */
function feedNotesUrl(entry: ContentFeedEntry, feed: ContentFeed): string | undefined {
  const url = localizeUrl(entry.url)
  // Riot's schedule page is a fallback, not patch notes.
  if (entry.source === 'riot') return url?.includes('/news/') ? url : undefined
  if (entry.source === 'ggg' && entry.gameKey === 'poe' && entry.kind === 'season') {
    return findNotesUrl('poe', entry.title, feed) ?? url
  }
  return url
}

function fromFeed(entry: ContentFeedEntry, parents: Map<number, ReleaseItem>, feed: ContentFeed): ReleaseItem {
  const ui = getUi()
  const notesUrl = feedNotesUrl(entry, feed)
  const isPatchNotes = entry.kind === 'patch' || (entry.kind === 'set' && entry.ongoing) || notesUrl !== localizeUrl(entry.url)
  const summary = [
    entry.kind === 'launch' && entry.gameKey === 'poe2' ? ui.content.poe2LaunchSummary(entry.name) : undefined,
    entry.tbd ? ui.content.tbdSummary : undefined,
    entry.previewDate ? ui.content.previewOn(formatDisplayDate(entry.previewDate)) : undefined,
  ]
    .filter(Boolean)
    .join(' ')

  return contentItem({
    ...baseItem(findGame(entry.gameKey), parents),
    id: `content-${entry.id}`,
    title: feedTitle(entry),
    contentKind: entry.kind,
    source: SOURCE_NAMES[entry.source],
    sourceUrl: localizeUrl(entry.url),
    notesUrl,
    notesLabel: isPatchNotes ? undefined : ui.content.officialPage,
    summary: summary || undefined,
    releaseDate: entry.date,
    endDate: entry.endDate,
    ongoing: entry.ongoing,
    ...(entry.tbd ? { dateCertainty: 'unknown' as const, releaseDateLabel: ui.content.tbd } : {}),
  })
}

function fromManual(entry: ManualContentEntry, parents: Map<number, ReleaseItem>, index: number): ReleaseItem {
  const exact = !entry.dateFormat || entry.dateFormat === 'exact'
  return contentItem({
    ...baseItem(findGame(entry.gameKey), parents),
    id: `content-manual-${entry.gameKey}-${index}`,
    title: entry.title,
    summary: entry.summary,
    contentKind: entry.kind,
    releaseDate: entry.date,
    releaseDateLabel: exact || entry.dateFormat !== 'year' ? formatDisplayDate(entry.date) : entry.date.slice(0, 4),
    dateCertainty: exact ? 'confirmed' : 'estimated',
    source: 'DropWhen',
    sourceUrl: entry.url,
  })
}

/**
 * Trims the "right now" noise:
 * - seasons and TFT sets: only the latest started one per game is kept (and flagged as running),
 * - patches: only the latest released one per game is kept,
 * - other released content older than the recent window is dropped.
 */
function keepLatestPerGame(items: ReleaseItem[], today: string, recentStart: string): ReleaseItem[] {
  const group = (item: ReleaseItem) =>
    item.contentKind === 'season' || item.contentKind === 'set'
      ? 'season'
      : item.contentKind === 'patch'
        ? 'patch'
        : undefined
  const latest = new Map<string, ReleaseItem>()

  for (const item of items) {
    const date = item.releaseDate ?? ''
    const kind = group(item)
    if (!kind || !date || date > today) continue
    const key = `${item.parentTitle}|${kind}`
    const current = latest.get(key)
    if (!current || date > (current.releaseDate ?? '')) latest.set(key, item)
  }

  return items.flatMap((item) => {
    const date = item.releaseDate ?? ''
    if (!date || date > today) return [item]
    const kind = group(item)
    if (kind) {
      if (latest.get(`${item.parentTitle}|${kind}`) !== item) return []
      // IGDB seasons have no end date: the latest started one is considered running.
      return [kind === 'season' && !item.endDate ? { ...item, ongoing: true } : item]
    }
    return date >= recentStart ? [item] : []
  })
}

async function fetchFeed(): Promise<ContentFeed> {
  const response = await fetch('/api/content-feed', { headers: { Accept: 'application/json' } })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return (await response.json()) as ContentFeed
}

export async function fetchTrackedContent(): Promise<ContentResult> {
  const today = getTodayIso()
  const recentStart = addDays(today, -RECENT_DAYS)
  const seasonStart = addDays(today, -SEASON_RUNNING_DAYS)
  const end = addMonths(today, LOOKAHEAD_MONTHS)
  const parentIds = TRACKED_GAMES.flatMap((game) => game.igdbIds)

  const [igdb, feedResult] = await Promise.allSettled([
    fetchIgdbContent(parentIds, toTimestamp(seasonStart), toTimestamp(end)),
    fetchFeed(),
  ])

  const failedSources: string[] = []
  const feed = feedResult.status === 'fulfilled' ? feedResult.value : EMPTY_FEED
  if (feedResult.status === 'rejected') failedSources.push('Riot, Blizzard, Grinding Gear Games')
  failedSources.push(...feed.errors)

  const parents = igdb.status === 'fulfilled' ? igdb.value.parents : new Map<number, ReleaseItem>()
  const items: ReleaseItem[] = []

  if (igdb.status === 'fulfilled') {
    for (const child of igdb.value.children) {
      const item = fromIgdb(child, parents, feed)
      if (item) items.push(item)
    }
  } else {
    failedSources.push('IGDB')
  }

  for (const entry of feed.entries) {
    const item = fromFeed(entry, parents, feed)
    // Old patches/seasons are noise; keep recent ones and anything still running.
    if (item.ongoing || !item.releaseDate || item.releaseDate >= seasonStart) items.push(item)
  }

  MANUAL_CONTENT.forEach((entry, index) => items.push(fromManual(entry, parents, index)))

  return { items: dedupe(keepLatestPerGame(items, today, recentStart)), failedSources }
}
