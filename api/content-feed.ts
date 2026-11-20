/**
 * Seasons, sets, patches and launches, from the publishers' OFFICIAL pages only:
 * - Riot: League of Legends patch schedule + patch notes, Teamfight Tactics news (sets)
 * - Blizzard news: World of Warcraft (Retail & Forever) and Diablo IV announcements, PTRs
 * - Grinding Gear Games forum: Path of Exile 1 & 2 announcements and patch notes
 *
 * A season that is announced (named, PTR open…) but not dated yet is returned with
 * `tbd: true` instead of a guessed date. All these pages allow automated access
 * (checked in their robots.txt).
 *
 * Every source fails independently: a broken source only drops its own data.
 */
export const config = {
  runtime: 'edge',
}

export interface ContentFeedEntry {
  id: string
  source: 'riot' | 'tft' | 'blizzard' | 'ggg'
  /** Key of the tracked game (see src/data/tracked-games.ts) */
  gameKey: string
  kind: 'patch' | 'season' | 'set' | 'update' | 'launch'
  title: string
  /** Patch number ("26.24"), season number ("2") or TFT set number ("19") */
  number?: string
  /** TFT set name ("Prismatic Tour") */
  name?: string
  /** ISO date (YYYY-MM-DD) */
  date?: string
  /** Announced, date not published yet */
  tbd?: boolean
  /** Date of an official presentation (developer livestream…) of upcoming content */
  previewDate?: string
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
  errors: string[]
}

const USER_AGENT = 'Mozilla/5.0 (compatible; DropWhen/1.0; release calendar)'
const LOL_SCHEDULE_URL =
  'https://support.riotgames.com/en-us/league-of-legends/gameplay/patch-schedule-league-of-legends'
const LOL_PATCH_NOTES_URL = 'https://www.leagueoflegends.com/en-us/news/tags/patch-notes/'
const TFT_NEWS_URL = 'https://teamfighttactics.leagueoflegends.com/en-us/news/'
const POE_FORUM = 'https://www.pathofexile.com'
/** GGG forum threads whose body is read to find launch dates and league names. */
const POE_BODIES_TO_READ = 3
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

const MONTH_PATTERN =
  '(January|February|March|April|May|June|July|August|September|October|November|December)'

/** "December 1" → ISO date; a month already well past this year means next year. */
function resolveMonthDay(monthName: string, day: string, today: string): string | undefined {
  const month = MONTHS[monthName.toLowerCase()]
  if (!month) return undefined
  const year = Number(today.slice(0, 4))
  const candidate = `${year}-${month}-${day.padStart(2, '0')}`
  return candidate < addDays(today, -60) ? `${year + 1}${candidate.slice(4)}` : candidate
}

/**
 * Official titles that carry their own date:
 * "Midnight: Echoes of the Worldcore Arrives on December 1",
 * "The Shadows Deepen: Midnight Season 2 Begins August 18",
 * "Play Path of Exile: Covens of Umbra on November 13 PST".
 */
export function parseDatedTitle(title: string, today: string): { name: string; date: string } | undefined {
  const verb = title.match(
    new RegExp(`^(.*?)\\s+(?:Arrives?|Begins?|Launch(?:es)?|Starts?|Unlocks?|Goes Live|Returns?)\\s+(?:on\\s+)?${MONTH_PATTERN}\\s+(\\d{1,2})\\b`, 'i'),
  )
  const play = title.match(new RegExp(`^Play\\s+(.*?)\\s+on\\s+${MONTH_PATTERN}\\s+(\\d{1,2})\\b`, 'i'))
  const match = verb ?? play
  if (!match) return undefined
  const date = resolveMonthDay(match[2], match[3], today)
  // "The Shadows Deepen: Midnight Season 2" → keep the part naming the content.
  const name = match[1].replace(/^.*?:\s*(?=.*Season \d+)/i, '').trim()
  return date && name ? { name, date } : undefined
}

async function fetchArticleText(url: string): Promise<string> {
  return stripTags((await fetchText(url)).replace(/<script[\s\S]*?<\/script>/gi, ''))
}

function blizzardEntries(articles: BlizzardArticle[], gameKey: string, today: string): ContentFeedEntry[] {
  return articles.flatMap((article) => {
    const dated = parseDatedTitle(article.title, today)
    if (!dated) return []
    const season = dated.name.match(/Season (\d+)/i)?.[1]
    return [
      {
        id: `blizzard-${article.url.match(/article\/(\d+)/)?.[1] ?? dated.name}`,
        source: 'blizzard' as const,
        gameKey: gameKey === 'wow' && /forever/i.test(article.title) ? 'wow-forever' : gameKey,
        kind: season ? ('season' as const) : ('update' as const),
        title: dated.name,
        number: season,
        date: dated.date,
        url: article.url,
      },
    ]
  })
}

/**
 * Diablo IV announces a season through its PTR ("The 3.3.0 PTR … for Diablo IV's Season 16")
 * weeks before giving a date. No dated article for that season yet → TBD entry.
 */
async function diabloUpcomingSeason(
  articles: BlizzardArticle[],
  dated: ContentFeedEntry[],
  today: string,
): Promise<ContentFeedEntry[]> {
  const ptr = articles.find((article) => /\bPTR\b/.test(article.title))
  if (!ptr) return []
  const ptrText = await fetchArticleText(ptr.url)
  const season = ptrText.match(/Season (\d+)/)?.[1]
  if (!season || dated.some((entry) => entry.number === season)) return []

  // An announced developer livestream presents the season (and usually its date).
  const livestream = articles.find((article) => /livestream/i.test(article.title))
  let previewDate: string | undefined
  if (livestream) {
    const text = await fetchArticleText(livestream.url).catch(() => '')
    const match = text.match(new RegExp(`(?:begins|starts|live)\\s+on\\s+${MONTH_PATTERN}\\s+(\\d{1,2})`, 'i'))
    previewDate = match ? resolveMonthDay(match[1], match[2], today) : undefined
    if (previewDate && previewDate < today) previewDate = undefined
  }

  return [
    {
      id: `blizzard-d4-season-${season}`,
      source: 'blizzard',
      gameKey: 'd4',
      kind: 'season',
      title: `Season ${season}`,
      number: season,
      tbd: true,
      previewDate,
      url: ptr.url,
    },
  ]
}

/* ---------------- Path of Exile (Grinding Gear Games forum) ---------------- */

interface ForumThreadWithDate extends ForumThread {
  postedAt?: string
}

async function fetchForumThreads(forum: string): Promise<ForumThreadWithDate[]> {
  const html = await fetchText(`${POE_FORUM}/forum/view-forum/${forum}`)
  return [
    ...html.matchAll(
      /<div class="title">\s*<a href="(\/forum\/view-thread\/\d+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<span class="post_date">([^<]*)<\/span>/g,
    ),
  ]
    .map((match) => ({ title: stripTags(match[2]), url: `${POE_FORUM}${match[1]}`, postedAt: match[3].trim() }))
    .slice(0, 30)
}

/**
 * - "Play Path of Exile: Covens of Umbra on November 13 PST" → dated PoE 1 league
 * - Announcement posts ("ExileCon 2026 Announcements", "… Full Reveal") are read for
 *   "Path of Exile 2 goes free-to-play on December 11" and "the new X Challenge League".
 */
async function poeEntries(threads: ForumThreadWithDate[], today: string): Promise<ContentFeedEntry[]> {
  const entries: ContentFeedEntry[] = []

  for (const thread of threads) {
    const dated = parseDatedTitle(thread.title, today)
    if (!dated) continue
    const isPoe2 = /Path of Exile 2/i.test(dated.name)
    const league = dated.name.replace(/^Path of Exile(?: [12])?:\s*/i, '').replace(/\s+for free$/i, '').trim()
    entries.push({
      id: `ggg-${thread.url.match(/\d+$/)?.[0] ?? league}`,
      source: 'ggg',
      gameKey: isPoe2 ? 'poe2' : 'poe',
      kind: 'season',
      title: league,
      date: dated.date,
      url: thread.url,
    })
  }

  const announcements = threads
    .filter((thread) => /announcements|reveal|full release|launch/i.test(thread.title))
    .slice(0, POE_BODIES_TO_READ)
  const bodies = await Promise.all(
    announcements.map(async (thread) => ({ thread, text: await fetchArticleText(thread.url).catch(() => '') })),
  )
  for (const { thread, text } of bodies) {
    const launch = text.match(
      new RegExp(`Path of Exile 2[^.]{0,60}?(?:goes free-to-play|launches|releases|is out)[^.]{0,30}?on\\s+${MONTH_PATTERN}\\s+(\\d{1,2})`, 'i'),
    )
    if (!launch || entries.some((entry) => entry.kind === 'launch')) continue
    const date = resolveMonthDay(launch[1], launch[2], today)
    if (!date || date < today) continue
    const league = text.match(/new ([A-Z][\w’' ]{2,40}?) Challenge League/)?.[1]
    entries.push({
      id: 'ggg-poe2-launch',
      source: 'ggg',
      gameKey: 'poe2',
      kind: 'launch',
      title: '1.0',
      name: league,
      date,
      url: thread.url,
    })
  }

  return entries
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
  const [schedule, lolNotes, tft, d4, wow, poePatchNotes, poe2PatchNotes, poe2News, poeNews] =
    await Promise.allSettled([
      fetchText(LOL_SCHEDULE_URL).then(parseRiotSchedule),
      fetchLolPatchNotes(),
      fetchTftSets(),
      fetchBlizzardFeed('diablo-4', 'Diablo IV'),
      fetchBlizzardFeed('world-of-warcraft', 'World of Warcraft'),
      fetchForumThreads('patch-notes'),
      fetchForumThreads('2212'),
      fetchForumThreads('2211'),
      fetchForumThreads('news'),
    ])

  const errors: string[] = []
  const scheduleRows = settled(schedule, [], errors, 'Riot')
  const notes = settled(lolNotes, new Map<string, string>(), errors, 'Riot patch notes')
  const tftSets = settled(tft, {} as TftSets, errors, 'TFT')
  const wowArticles = settled(wow, [], errors, 'Blizzard WoW')
  const d4Articles = settled(d4, [], errors, 'Blizzard Diablo')
  const poe2Announcements = settled(poe2News, [], errors, 'PoE2 forum')
  const poeAnnouncements = settled(poeNews, [], errors, 'PoE forum')

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
    // Riot reveals the next set (name, PBE) before dating it: no guessed date.
    entries.push({
      id: `tft-set-${tftSets.next.number}`,
      source: 'tft',
      gameKey: 'tft',
      kind: 'set',
      title: `Set ${tftSets.next.number}`,
      number: String(tftSets.next.number),
      name: tftSets.next.name,
      tbd: true,
      url: tftSets.next.url,
    })
  }

  entries.push(...blizzardEntries(wowArticles, 'wow', today))
  const d4Dated = blizzardEntries(d4Articles, 'd4', today)
  entries.push(...d4Dated)
  entries.push(...(await diabloUpcomingSeason(d4Articles, d4Dated, today).catch(() => [])))
  entries.push(...(await poeEntries([...poeAnnouncements, ...poe2Announcements], today).catch(() => [])))

  const isPatchNotes = (article: BlizzardArticle) => /patch-notes|content-update-notes/i.test(article.url)

  const value: ContentFeed = {
    entries,
    links: {
      d4PatchNotes: d4Articles.find(isPatchNotes)?.url,
      wowPatchNotes: wowArticles.find(isPatchNotes)?.url,
      poe1PatchThreads: settled(poePatchNotes, [], errors, 'PoE forum'),
      poe2PatchThreads: settled(poe2PatchNotes, [], errors, 'PoE2 forum'),
      poe2Announcements,
    },
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
