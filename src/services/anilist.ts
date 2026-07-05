import { ui } from '../i18n'
import type { ReleaseItem, SearchResult } from '../types'
import { formatDisplayDate, toIsoDate } from '../utils/dates'

const ANILIST_URL = 'https://graphql.anilist.co'

interface AniListMedia {
  id: number
  title: { romaji: string | null; english: string | null; native: string | null }
  startDate: { year: number | null; month: number | null; day: number | null } | null
  format: string | null
  status: string | null
  siteUrl: string | null
}

const SEARCH_MANGA_QUERY = `
  query ($search: String) {
    Page(page: 1, perPage: 20) {
      media(search: $search, type: MANGA, sort: SEARCH_MATCH) {
        id
        title { romaji english native }
        startDate { year month day }
        format
        status
        siteUrl
      }
    }
  }
`

function pickTitle(media: AniListMedia): string {
  return media.title.romaji || media.title.english || media.title.native || ui.dates.untitled
}

function mapAniListManga(media: AniListMedia): ReleaseItem {
  const releaseDate = toIsoDate(
    media.startDate?.year,
    media.startDate?.month,
    media.startDate?.day,
  )
  return {
    id: `anilist-${media.id}`,
    title: pickTitle(media),
    releaseDate,
    releaseDateLabel: releaseDate ? formatDisplayDate(releaseDate) : ui.dates.jpUnknown,
    dateCertainty: releaseDate ? 'estimated' : 'unknown',
    dateLocale: 'jp',
    platformOrPublisher: media.format?.replace(/_/g, ' ') ?? undefined,
    source: 'AniList',
    sourceUrl: media.siteUrl ?? `https://anilist.co/manga/${media.id}`,
    category: 'manga',
  }
}

export async function searchMangaAniList(query: string): Promise<SearchResult> {
  try {
    const response = await fetch(ANILIST_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ query: SEARCH_MANGA_QUERY, variables: { search: query } }),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const payload = (await response.json()) as {
      data?: { Page?: { media: AniListMedia[] } }
      errors?: Array<{ message: string }>
    }
    if (payload.errors?.length) throw new Error(payload.errors[0].message)
    const media = payload.data?.Page?.media ?? []
    return {
      items: media.map(mapAniListManga),
      warning: media.length > 0 ? ui.warnings.anilistJpDates : undefined,
    }
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'unknown error'
    return { items: [], warning: ui.warnings.anilistUnavailable(detail) }
  }
}
