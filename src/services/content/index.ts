import { getLocale, getUi } from '../../i18n'
import { MANUAL_CONTENT } from '../../data/manual-content'
import { TRACKED_GAMES, type TrackedGame } from '../../data/tracked-games'
import type { ReleaseItem } from '../../types'
import { formatDisplayDate, formatShortDate, getTodayIso, isPastRelease } from '../../utils/dates'
import { fetchIgdbContent, type IgdbContentItem } from '../igdb'
import type { ContentFeed, ContentFeedEntry, ContentKind, ManualContentEntry } from './types'

/** How far back a released item still counts as "right now". */
const RECENT_DAYS = 45
/** A season started within this window with no known end is considered still running. */
const SEASON_RUNNING_DAYS = 120
/** How far ahead we look (items past the month sections land in "Later"). */
const LOOKAHEAD_MONTHS = 18

const POE2_IGDB_ID = 125642
const POE2_SITE = 'https://pathofexile2.com'

const IGDB_TYPE_TO_KIND: Record<number, ContentKind> = {
  1: 'dlc',
  2: 'expansion',
  4: 'expansion',
  6: 'season',
  7: 'season',
  13: 'pack',
  14: 'update',
}

const EMPTY_FEED: ContentFeed = {
  entries: [],
  links: { poe1PatchThreads: [], poe2PatchThreads: [], poe2Announcements: [] },
  poe2Leagues: {},
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

function fromFeed(entry: ContentFeedEntry, parents: Map<number, ReleaseItem>): ReleaseItem {
  const ui = getUi()
  const game = findGame(entry.gameKey)
  const source = { riot: 'Riot Games', tft: 'Riot Games', raiderio: 'Raider.IO', blizzard: 'Blizzard' }[
    entry.source
  ]
  const isOfficialPage = entry.kind === 'set' && !entry.ongoing
  const notesUrl = localizeUrl(entry.url)

  const fields = {
    ...baseItem(game, parents),
    id: `content-${entry.id}`,
    source,
    sourceUrl: notesUrl,
    // Direct patch notes when Riot has published them; the schedule page otherwise.
    notesUrl: notesUrl?.includes('/news/') || entry.source !== 'riot' ? notesUrl : undefined,
    notesLabel: isOfficialPage || entry.source === 'blizzard' ? ui.content.officialPage : undefined,
    releaseDate: entry.date,
    endDate: entry.endDate,
    ongoing: entry.ongoing,
    contentKind: entry.kind,
  }

  if (entry.kind === 'set' && entry.number) {
    const estimated = entry.dateEstimated && entry.date
    return contentItem({
      ...fields,
      title: ui.content.tftSet(entry.number, entry.name),
      ...(estimated
        ? {
            dateCertainty: 'estimated' as const,
            approximateDay: true,
            releaseDateLabel: `~${formatShortDate(entry.date)}`,
            summary: entry.estimatedFromPatch ? ui.content.estimatedFromPatch(entry.estimatedFromPatch) : undefined,
          }
        : {}),
    })
  }

  const title =
    entry.kind === 'patch' && entry.number
      ? ui.content.patch(entry.number)
      : entry.source === 'raiderio' && entry.number
        ? ui.content.mythicPlusSeason(entry.number)
        : entry.title
  return contentItem({ ...fields, title })
}

/** Path of Exile 2: 1.0 launch (IGDB) + league names (poe.ninja) + forum links. */
function poe2Items(fullReleaseDate: string | undefined, parents: Map<number, ReleaseItem>, feed: ContentFeed, today: string): ReleaseItem[] {
  const ui = getUi()
  const game = findGame('poe2')
  const items: ReleaseItem[] = []
  const { current, upcoming } = feed.poe2Leagues
  const latestPatchNotes = feed.links.poe2PatchThreads.find((thread) => /patch notes/i.test(thread.title))

  if (fullReleaseDate && fullReleaseDate >= today) {
    const announcement = feed.links.poe2Announcements.find((thread) => /full release|1\.0/i.test(thread.title))
    items.push(
      contentItem({
        ...baseItem(game, parents),
        id: 'content-poe2-launch',
        title: ui.content.poe2Launch(upcoming),
        summary: ui.content.poe2LaunchSummary(upcoming),
        contentKind: 'launch',
        releaseDate: fullReleaseDate,
        source: 'Grinding Gear Games',
        sourceUrl: announcement?.url ?? POE2_SITE,
        notesUrl: announcement?.url ?? POE2_SITE,
        notesLabel: ui.content.officialPage,
      }),
    )
  }

  if (current) {
    items.push(
      contentItem({
        ...baseItem(game, parents),
        id: `content-poe2-league-${current}`,
        title: current,
        contentKind: 'season',
        ongoing: true,
        source: 'Grinding Gear Games',
        sourceUrl: latestPatchNotes?.url ?? POE2_SITE,
        notesUrl: latestPatchNotes?.url,
      }),
    )
  }
  return items
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
  if (feedResult.status === 'rejected') failedSources.push('Riot, Blizzard, Raider.IO, PoE')
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
    const item = fromFeed(entry, parents)
    // Old patches/seasons are noise; keep recent ones and anything still running.
    if (item.ongoing || !item.releaseDate || item.releaseDate >= seasonStart) items.push(item)
  }

  const poe2FullRelease = igdb.status === 'fulfilled' ? igdb.value.fullReleases.get(POE2_IGDB_ID) : undefined
  items.push(...poe2Items(poe2FullRelease, parents, feed, today))

  MANUAL_CONTENT.forEach((entry, index) => items.push(fromManual(entry, parents, index)))

  return { items: dedupe(keepLatestPerGame(items, today, recentStart)), failedSources }
}
