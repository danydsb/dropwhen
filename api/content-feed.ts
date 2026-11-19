/**
 * Aggregates live-service content that IGDB does not cover (or covers badly):
 * - League of Legends: patch schedule (Riot support page) + direct patch notes links
 * - Teamfight Tactics: current / next set (number, name, patch notes) from the TFT news page
 * - World of Warcraft: Mythic+ seasons (Raider.IO) + dated announcements (Blizzard news)
 * - Diablo IV: latest patch notes article (Blizzard news)
 * - Path of Exile 1 & 2: patch notes / announcement threads (official forum)
 * - Path of Exile 2: current and upcoming league names (poe.ninja)
 *
 * Every source fails independently: a broken source only drops its own data.
 */
export const config = {
  runtime: 'edge',
}

export interface ContentFeedEntry {
  id: string
  source: 'riot' | 'tft' | 'raiderio' | 'blizzard'
  /** Key of the tracked game (see src/data/tracked-games.ts) */
  gameKey: string
  kind: 'patch' | 'season' | 'set' | 'update'
  title: string
  /** Patch number ("26.24"), season number ("2") or TFT set number ("19") */
  number?: string
  /** TFT set name ("Prismatic Tour") */
  name?: string
  /** ISO date (YYYY-MM-DD) */
  date?: string
  /** The date is an estimate (e.g. next TFT set → next big patch) */
  dateEstimated?: boolean
  /** Patch the estimated date was derived from */
  estimatedFromPatch?: string
  endDate?: string
  ongoing?: boolean
  /** Patch notes (or the most relevant official article) */
  url?: string
}

export interface ForumThread {
  title: string
  url: string
}

export interface ContentFeed {
  entries: ContentFeedEntry[]
  links: {
    d4PatchNotes?: string
    wowPatchNotes?: string
    poe1PatchThreads: ForumThread[]
    poe2PatchThreads: ForumThread[]
    poe2Announcements: ForumThread[]
  }
  poe2Leagues: { current?: string; upcoming?: string }
  errors: string[]
}

const USER_AGENT = 'Mozilla/5.0 (compatible; DropWhen/1.0; release calendar)'
const LOL_SCHEDULE_URL =
  'https://support.riotgames.com/en-us/league-of-legends/gameplay/patch-schedule-league-of-legends'
const LOL_PATCH_NOTES_URL = 'https://www.leagueoflegends.com/en-us/news/tags/patch-notes/'
const TFT_NEWS_URL = 'https://teamfighttactics.leagueoflegends.com/en-us/news/'
/** Raider.IO expansion ids: 11 = Midnight. 12 is probed so the next expansion shows up on its own. */
const RAIDERIO_EXPANSIONS = [11, 12]
const POE_FORUM = 'https://www.pathofexile.com'
/** Days between a set's first article (PBE reveal) and its earliest plausible launch. */
const TFT_MIN_PBE_DAYS = 14
const CACHE_TTL_MS = 30 * 60 * 1000

const MONTHS: Record<string, string> = {
  january: '01',
  february: '02',
  march: '03',
  april: '04',
  may: '05',
  june: '06',
  july: '07',
  august: '08',
  september: '09',
  october: '10',
  november: '11',
  december: '12',
}

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
  if (!response.ok) throw new Error(`${new URL(url).hostname} HTTP ${response.status}`)
  return response.text()
}

function decodeEntities(text: string): string {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&rsquo;|&#x27;/g, '’')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

function stripTags(html: string): string {
  return decodeEntities(html.replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim()
}

function addDays(iso: string, days: number): string {
  const date = new Date(`${iso}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

/* ---------------- League of Legends ---------------- */

export function parseRiotSchedule(html: string): Array<{ patch: string; date: string }> {
  const table = html.match(/<table[\s\S]*?<\/table>/i)?.[0]
  if (!table) return []

  const rows: Array<{ patch: string; date: string }> = []
  for (const row of table.match(/<tr[\s\S]*?<\/tr>/gi) ?? []) {
    const [patch, dateText] = (row.match(/<td[\s\S]*?<\/td>/gi) ?? []).map(stripTags)
    if (!patch || !dateText || !/^\d{2}\.\d{1,2}$/.test(patch)) continue
    const match = dateText.match(/([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})/)
    const month = match ? MONTHS[match[1].toLowerCase()] : undefined
    if (!match || !month) continue
    rows.push({ patch, date: `${match[3]}-${month}-${match[2].padStart(2, '0')}` })
  }
  return rows
}

async function fetchLolPatchNotes(): Promise<Map<string, string>> {
  const html = await fetchText(LOL_PATCH_NOTES_URL)
  const notes = new Map<string, string>()
  for (const match of html.matchAll(/href="(\/en-us\/news\/game-updates\/league-of-legends-patch-(\d+)-(\d+)-notes\/?)"/g)) {
    notes.set(`${match[2]}.${match[3].padStart(2, '0')}`, `https://www.leagueoflegends.com${match[1]}`)
  }
  return notes
}

/* ---------------- Teamfight Tactics ---------------- */

interface TftArticle {
  title: string
  date: string
  url: string
}

function collectArticles(node: unknown, out: TftArticle[]): void {
  if (Array.isArray(node)) {
    for (const child of node) collectArticles(child, out)
    return
  }
  if (!node || typeof node !== 'object') return
  const record = node as Record<string, unknown>
  const date = record.publishedAt ?? record.date
  const action = record.action as { payload?: { url?: string } } | undefined
  const url = action?.payload?.url ?? (typeof record.url === 'string' ? record.url : undefined)
  if (typeof record.title === 'string' && typeof date === 'string' && url) {
    out.push({
      title: record.title,
      date: date.slice(0, 10),
      url: url.startsWith('/') ? `https://teamfighttactics.leagueoflegends.com${url}` : url,
    })
  }
  for (const value of Object.values(record)) collectArticles(value, out)
}

export function cleanTftSetName(title: string): string | undefined {
  const match = title.match(/TFT Set (\d+)\s*[-–:]?\s*(.+)$/i)
  if (!match) return undefined
  const name = match[2]
    .replace(/\s*\|.*$/, '')
    .replace(/\s+(Overview|PBE.*|Cosmetics.*|Rundown.*)$/i, '')
    .trim()
  return name || undefined
}

interface TftSets {
  current?: { number: number; name?: string; start?: string; notesUrl?: string }
  next?: { number: number; name?: string; firstSeen: string; url?: string; start?: string }
}

async function fetchTftSets(): Promise<TftSets> {
  const html = await fetchText(TFT_NEWS_URL)
  const json = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)?.[1]
  if (!json) throw new Error('TFT news: no data')

  const articles: TftArticle[] = []
  collectArticles(JSON.parse(json), articles)

  const patches = articles
    .map((article) => ({ article, match: article.title.match(/^Teamfight Tactics patch (\d+)\.(\d+)/i) }))
    .filter((entry) => entry.match)
    .map(({ article, match }) => ({ set: Number(match![1]), minor: Number(match![2]), article }))
  if (patches.length === 0) return {}

  const currentNumber = Math.max(...patches.map((patch) => patch.set))
  const currentPatches = patches
    .filter((patch) => patch.set === currentNumber)
    .sort((a, b) => b.minor - a.minor)

  const names = new Map<number, { name: string; firstSeen: string; url: string }>()
  for (const article of articles) {
    const number = Number(article.title.match(/TFT Set (\d+)/i)?.[1])
    const name = cleanTftSetName(article.title)
    if (!number || !name) continue
    const existing = names.get(number)
    // Prefer the shortest clean name; remember the earliest mention (≈ PBE reveal).
    if (!existing || name.length < existing.name.length) {
      names.set(number, {
        name,
        firstSeen: existing && existing.firstSeen < article.date ? existing.firstSeen : article.date,
        url: /overview/i.test(article.title) || !existing ? article.url : existing.url,
      })
    } else if (article.date < existing.firstSeen) {
      existing.firstSeen = article.date
    }
  }

  const next = names.get(currentNumber + 1)
  return {
    current: {
      number: currentNumber,
      name: names.get(currentNumber)?.name,
      start: currentPatches.find((patch) => patch.minor === 1)?.article.date,
      notesUrl: currentPatches[0]?.article.url,
    },
    next: next ? { number: currentNumber + 1, ...next } : undefined,
  }
}

/* ---------------- World of Warcraft / Diablo IV ---------------- */

interface BlizzardArticle {
  title: string
  url: string
}

async function fetchBlizzardFeed(slug: string, gameLabel: string): Promise<BlizzardArticle[]> {
  const html = await fetchText(`https://news.blizzard.com/en-us/feed/${slug}`)
  const articles: BlizzardArticle[] = []
  const seen = new Set<string>()
  for (const match of html.matchAll(/href="(\/en-us\/article\/\d+\/[^"]+)"([\s\S]*?)<\/a>/g)) {
    if (seen.has(match[1])) continue
    seen.add(match[1])
    const text = stripTags(match[2]).replace(/^>\s*/, '')
    const labelIndex = text.indexOf(` ${gameLabel} `)
    articles.push({
      title: labelIndex > 0 ? text.slice(0, labelIndex) : text,
      url: `https://news.blizzard.com${match[1]}`,
    })
  }
  return articles
}

/** "Midnight: Echoes of the Worldcore Arrives on December 1" → dated update. */
export function parseArrivalAnnouncement(
  title: string,
  today: string,
): { name: string; date: string } | undefined {
  const match = title.match(/^(.*?)\s+Arrives?\s+(?:on\s+)?([A-Z][a-z]+)\s+(\d{1,2})\b/)
  const month = match ? MONTHS[match[2].toLowerCase()] : undefined
  if (!match || !month) return undefined
  const year = Number(today.slice(0, 4))
  const candidate = `${year}-${month}-${match[3].padStart(2, '0')}`
  // An announcement for "January 5" published in December is for next year.
  const date = candidate < addDays(today, -60) ? `${year + 1}${candidate.slice(4)}` : candidate
  return { name: match[1].trim(), date }
}

async function fetchMythicPlusSeasons(): Promise<ContentFeedEntry[]> {
  const today = todayIso()
  const results = await Promise.allSettled(
    RAIDERIO_EXPANSIONS.map(async (expansionId) => {
      const response = await fetch(
        `https://raider.io/api/v1/mythic-plus/static-data?expansion_id=${expansionId}`,
        { headers: { 'User-Agent': USER_AGENT } },
      )
      if (!response.ok) return []
      const data = (await response.json()) as {
        seasons?: Array<{ slug: string; starts?: Record<string, string | null>; ends?: Record<string, string | null> }>
      }
      return data.seasons ?? []
    }),
  )

  const entries: ContentFeedEntry[] = []
  for (const result of results) {
    if (result.status !== 'fulfilled') continue
    for (const season of result.value) {
      // Main seasons only (drops "break the meta", cutoffs, remix variants…)
      const seasonNumber = season.slug.match(/^season-[a-z]+-(\d+)$/)?.[1]
      const start = (season.starts?.eu ?? season.starts?.us)?.slice(0, 10)
      if (!seasonNumber || !start) continue
      const end = season.ends?.eu ?? season.ends?.us ?? undefined
      // Raider.IO uses a far-future placeholder while the end date is unknown.
      const knownEnd = end && !end.startsWith('2030') ? end.slice(0, 10) : undefined

      entries.push({
        id: `raiderio-${season.slug}`,
        source: 'raiderio',
        gameKey: 'wow',
        kind: 'season',
        title: `Mythic+ Season ${seasonNumber}`,
        number: seasonNumber,
        date: start,
        endDate: knownEnd,
        ongoing: start <= today && (!knownEnd || knownEnd > today),
        url: `https://raider.io/mythic-plus-rankings/${season.slug}/world/all/leaderboards`,
      })
    }
  }
  return entries
}

/* ---------------- Path of Exile ---------------- */

async function fetchForumThreads(forum: string): Promise<ForumThread[]> {
  const html = await fetchText(`${POE_FORUM}/forum/view-forum/${forum}`)
  return [...html.matchAll(/<div class="title">\s*<a href="(\/forum\/view-thread\/\d+)"[^>]*>([\s\S]*?)<\/a>/g)]
    .map((match) => ({ title: stripTags(match[2]), url: `${POE_FORUM}${match[1]}` }))
    .slice(0, 25)
}

async function fetchPoe2Leagues(): Promise<{ current?: string; upcoming?: string }> {
  const response = await fetch('https://poe.ninja/poe2/api/data/index-state', {
    headers: { 'User-Agent': USER_AGENT },
  })
  if (!response.ok) throw new Error(`poe.ninja HTTP ${response.status}`)
  const data = (await response.json()) as {
    economyLeagues?: Array<{ name: string; hardcore: boolean; indexed: boolean }>
  }
  // Newest leagues come first; a league listed before the indexed one is not live yet.
  const leagues = (data.economyLeagues ?? []).filter(
    (league) => !league.hardcore && !/^(standard|hardcore)$/i.test(league.name),
  )
  const currentIndex = leagues.findIndex((league) => league.indexed)
  return {
    current: currentIndex >= 0 ? leagues[currentIndex].name : undefined,
    upcoming: currentIndex > 0 ? leagues[currentIndex - 1].name : undefined,
  }
}

/* ---------------- Assembly ---------------- */

function settled<T>(result: PromiseSettledResult<T>, fallback: T, errors: string[], label: string): T {
  if (result.status === 'fulfilled') return result.value
  errors.push(label)
  return fallback
}

let cache: { expiresAt: number; value: ContentFeed } | undefined

export async function buildContentFeed(): Promise<ContentFeed> {
  if (cache && cache.expiresAt > Date.now()) return cache.value

  const today = todayIso()
  const [schedule, lolNotes, tft, raiderio, d4, wow, poe1, poe2Patches, poe2News, poe2Leagues] =
    await Promise.allSettled([
      fetchText(LOL_SCHEDULE_URL).then(parseRiotSchedule),
      fetchLolPatchNotes(),
      fetchTftSets(),
      fetchMythicPlusSeasons(),
      fetchBlizzardFeed('diablo-4', 'Diablo IV'),
      fetchBlizzardFeed('world-of-warcraft', 'World of Warcraft'),
      fetchForumThreads('patch-notes'),
      fetchForumThreads('2212'),
      fetchForumThreads('2211'),
      fetchPoe2Leagues(),
    ])

  const errors: string[] = []
  const scheduleRows = settled(schedule, [], errors, 'Riot')
  const notes = settled(lolNotes, new Map<string, string>(), errors, 'Riot patch notes')
  const tftSets = settled(tft, {} as TftSets, errors, 'TFT')
  const wowArticles = settled(wow, [], errors, 'Blizzard WoW')
  const d4Articles = settled(d4, [], errors, 'Blizzard Diablo')

  const entries: ContentFeedEntry[] = []

  for (const row of scheduleRows) {
    entries.push({
      id: `riot-${row.patch}`,
      source: 'riot',
      gameKey: 'lol',
      kind: 'patch',
      title: `Patch ${row.patch}`,
      number: row.patch,
      date: row.date,
      url: notes.get(row.patch) ?? LOL_SCHEDULE_URL,
    })
  }

  if (tftSets.current) {
    entries.push({
      id: `tft-set-${tftSets.current.number}`,
      source: 'tft',
      gameKey: 'tft',
      kind: 'set',
      title: `Set ${tftSets.current.number}`,
      number: String(tftSets.current.number),
      name: tftSets.current.name,
      date: tftSets.current.start,
      ongoing: true,
      url: tftSets.current.notesUrl,
    })
  }
  if (tftSets.next) {
    // A set launches with a big patch: the first scheduled patch at least two weeks after its reveal.
    const launchPatch = scheduleRows.find(
      (row) => row.date >= addDays(tftSets.next!.firstSeen, TFT_MIN_PBE_DAYS) && row.date >= today,
    )
    entries.push({
      id: `tft-set-${tftSets.next.number}`,
      source: 'tft',
      gameKey: 'tft',
      kind: 'set',
      title: `Set ${tftSets.next.number}`,
      number: String(tftSets.next.number),
      name: tftSets.next.name,
      date: launchPatch?.date,
      dateEstimated: Boolean(launchPatch),
      estimatedFromPatch: launchPatch?.patch,
      url: tftSets.next.url,
    })
  }

  entries.push(...settled(raiderio, [], errors, 'Raider.IO'))

  for (const article of wowArticles) {
    const announcement = parseArrivalAnnouncement(article.title, today)
    if (!announcement) continue
    entries.push({
      id: `blizzard-${article.url.match(/article\/(\d+)/)?.[1] ?? announcement.name}`,
      source: 'blizzard',
      gameKey: 'wow',
      kind: 'update',
      title: announcement.name,
      date: announcement.date,
      url: article.url,
    })
  }

  const isPatchNotes = (article: BlizzardArticle) => /patch-notes|content-update-notes/i.test(article.url)

  const value: ContentFeed = {
    entries,
    links: {
      d4PatchNotes: d4Articles.find(isPatchNotes)?.url,
      wowPatchNotes: wowArticles.find(isPatchNotes)?.url,
      poe1PatchThreads: settled(poe1, [], errors, 'PoE forum'),
      poe2PatchThreads: settled(poe2Patches, [], errors, 'PoE2 forum'),
      poe2Announcements: settled(poe2News, [], errors, 'PoE2 forum'),
    },
    poe2Leagues: settled(poe2Leagues, {}, errors, 'poe.ninja'),
    errors: [...new Set(errors)],
  }

  // Only cache complete results, so a transient failure is retried soon.
  if (value.errors.length === 0) cache = { expiresAt: Date.now() + CACHE_TTL_MS, value }
  return value
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const feed = await buildContentFeed()
  return new Response(JSON.stringify(feed), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
