import { getUi } from '../i18n'
import type { DateCertainty, ReleaseItem, SearchResult } from '../types'
import { formatDisplayDate, toIsoDate } from '../utils/dates'
import { fetchJsonViaProxy, fetchWithCorsFallback } from './cors-proxy'

const JIKAN_BASE = import.meta.env.VITE_JIKAN_BASE?.trim() || 'https://api.jikan.moe/v4'

interface JikanDateProp {
  day: number | null
  month: number | null
  year: number | null
}

interface JikanManga {
  mal_id: number
  url: string
  title: string
  title_english: string | null
  title_japanese: string | null
  type: string | null
  status: string | null
  published: {
    from: string | null
    to: string | null
    prop: {
      from: JikanDateProp
      to: JikanDateProp
    }
    string: string | null
  } | null
  serializations?: Array<{ name: string }>
}

interface JikanSearchResponse {
  data: JikanManga[]
  pagination?: { has_next_page: boolean }
}

function pickTitle(manga: JikanManga): string {
  const ui = getUi()
  return manga.title_english || manga.title || manga.title_japanese || ui.dates.untitled
}

function pickRelease(manga: JikanManga): {
  releaseDate?: string
  releaseDateLabel?: string
  dateCertainty: DateCertainty
} {
  const ui = getUi()
  const from = manga.published?.prop.from
  const releaseDate = from ? toIsoDate(from.year, from.month, from.day) : undefined

  if (manga.published?.string) {
    return {
      releaseDate,
      releaseDateLabel: manga.published.string,
      dateCertainty: from?.day ? 'confirmed' : from?.year ? 'estimated' : 'unknown',
    }
  }

  if (releaseDate) {
    return {
      releaseDate,
      releaseDateLabel: formatDisplayDate(releaseDate),
      dateCertainty: from?.day ? 'confirmed' : 'estimated',
    }
  }

  return {
    releaseDateLabel: manga.status === 'Not yet published' ? ui.dates.tba : ui.dates.jpUnknown,
    dateCertainty: 'unknown',
  }
}

function mapJikanManga(manga: JikanManga): ReleaseItem {
  const release = pickRelease(manga)
  const publisher = manga.serializations?.[0]?.name

  return {
    id: `jikan-${manga.mal_id}`,
    title: pickTitle(manga),
    releaseDate: release.releaseDate,
    releaseDateLabel: release.releaseDateLabel,
    dateCertainty: release.dateCertainty,
    dateLocale: 'jp',
    platformOrPublisher: [manga.type, publisher].filter(Boolean).join(' · ') || undefined,
    source: 'Jikan (MyAnimeList)',
    sourceUrl: manga.url,
    category: 'manga',
  }
}

async function fetchJikan<T>(path: string): Promise<T> {
  const url = `${JIKAN_BASE}${path}`
  try {
    const response = await fetchWithCorsFallback(url, {
      headers: { Accept: 'application/json' },
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return (await response.json()) as T
  } catch {
    return fetchJsonViaProxy<T>(url)
  }
}

export async function searchManga(query: string): Promise<SearchResult> {
  const ui = getUi()
  const params = new URLSearchParams({
    q: query,
    limit: '20',
    order_by: 'start_date',
    sort: 'desc',
  })

  try {
    const payload = await fetchJikan<JikanSearchResponse & { status?: number; message?: string }>(
      `/manga?${params}`,
    )

    if (payload.status && payload.status >= 400) {
      throw new Error(payload.message ?? `HTTP ${payload.status}`)
    }

    const items = (payload.data ?? []).map(mapJikanManga)
    return {
      items,
      warning: items.length > 0 ? ui.warnings.jikanDates : undefined,
    }
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'unknown error'
    return { items: [], warning: ui.warnings.jikanUnavailable(detail) }
  }
}
