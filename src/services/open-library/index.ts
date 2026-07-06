import { getLocale } from '../../i18n'
import { matchesSearch } from '../../utils/dates'
import { fetchJsonViaProxy, fetchWithCorsFallback } from '../cors-proxy'
import { parseOpenLibraryPublishDate } from './parse-date'
import type {
  OpenLibraryDoc,
  OpenLibraryFeed,
  OpenLibraryItem,
  OpenLibrarySearchResponse,
} from './types'
import {
  OPEN_LIBRARY_BASE,
  OPEN_LIBRARY_COVERS_BASE,
  OPEN_LIBRARY_SEARCH_URL,
} from './types'

const SEARCH_FIELDS = [
  'key',
  'title',
  'author_name',
  'cover_i',
  'publisher',
  'first_publish_year',
  'editions',
  'editions.key',
  'editions.title',
  'editions.publish_date',
].join(',')

const MAX_RESULTS = 20

const BD_COMICS_SUBJECTS =
  '(subject:comics OR subject:"bande dessinée" OR subject:"graphic novels" OR subject:"comic books")'

async function fetchOpenLibraryJson<T>(url: string): Promise<T> {
  const response = await fetchWithCorsFallback(url, {
    headers: { Accept: 'application/json' },
  })
  if (!response.ok) {
    throw new Error(`Open Library unavailable (HTTP ${response.status})`)
  }
  return response.json() as Promise<T>
}

async function fetchSearch(params: Record<string, string>): Promise<OpenLibrarySearchResponse> {
  const searchParams = new URLSearchParams({
    fields: SEARCH_FIELDS,
    limit: String(MAX_RESULTS),
    lang: getLocale(),
    ...params,
  })
  const url = `${OPEN_LIBRARY_SEARCH_URL}?${searchParams}`

  try {
    return await fetchOpenLibraryJson<OpenLibrarySearchResponse>(url)
  } catch {
    return fetchJsonViaProxy<OpenLibrarySearchResponse>(url)
  }
}

function pickPublisher(publishers?: string[]): string | undefined {
  return publishers?.find(Boolean)
}

function pickReleaseDate(doc: OpenLibraryDoc): {
  iso?: string
  certainty: OpenLibraryItem['date_certainty']
} {
  const editionDate = doc.editions?.docs?.[0]?.publish_date?.[0]
  if (editionDate) {
    return parseOpenLibraryPublishDate(editionDate)
  }

  if (doc.first_publish_year) {
    return {
      iso: `${doc.first_publish_year}-01-01`,
      certainty: 'estimated',
    }
  }

  return { certainty: 'unknown' }
}

function toCoverUrl(coverId?: number): string | undefined {
  if (!coverId) return undefined
  return `${OPEN_LIBRARY_COVERS_BASE}/b/id/${coverId}-M.jpg`
}

function toSourceUrl(key: string): string {
  return `${OPEN_LIBRARY_BASE}${key.startsWith('/') ? key : `/${key}`}`
}

function mapDoc(doc: OpenLibraryDoc): OpenLibraryItem {
  const editionTitle = doc.editions?.docs?.[0]?.title?.trim()
  const title = editionTitle && editionTitle !== doc.title ? editionTitle : doc.title
  const { iso, certainty } = pickReleaseDate(doc)

  return {
    title,
    type: 'comic',
    authors: doc.author_name?.filter(Boolean),
    publisher: pickPublisher(doc.publisher),
    release_date: iso,
    date_certainty: certainty,
    cover_url: toCoverUrl(doc.cover_i),
    source_url: toSourceUrl(doc.key),
  }
}

function matchesItem(item: OpenLibraryItem, query: string): boolean {
  const haystack = [item.title, item.publisher, ...(item.authors ?? [])].filter(Boolean).join(' ')
  return matchesSearch(haystack, query)
}

function mergeDocs(...responses: OpenLibrarySearchResponse[]): OpenLibraryDoc[] {
  const seen = new Set<string>()
  const docs: OpenLibraryDoc[] = []

  for (const response of responses) {
    for (const doc of response.docs ?? []) {
      if (seen.has(doc.key)) continue
      seen.add(doc.key)
      docs.push(doc)
    }
  }

  return docs
}

export async function searchOpenLibrary(query: string): Promise<OpenLibraryFeed> {
  const [subjectResults, titleResults] = await Promise.all([
    fetchSearch({ q: `${query} ${BD_COMICS_SUBJECTS}` }),
    fetchSearch({ title: query }),
  ])

  const items = mergeDocs(subjectResults, titleResults)
    .map(mapDoc)
    .filter((item) => matchesItem(item, query))

  return { source: 'openlibrary', items }
}

export { parseOpenLibraryPublishDate }
