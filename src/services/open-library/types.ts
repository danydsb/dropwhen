import type { DateCertainty } from '../../types'
import type { ReleaseType } from '../releases/types'

export interface OpenLibraryEdition {
  key?: string
  title?: string
  publish_date?: string[]
}

export interface OpenLibraryDoc {
  key: string
  title: string
  author_name?: string[]
  cover_i?: number
  publisher?: string[]
  first_publish_year?: number
  editions?: {
    docs?: OpenLibraryEdition[]
  }
}

export interface OpenLibrarySearchResponse {
  num_found: number
  docs: OpenLibraryDoc[]
}

export interface OpenLibraryItem {
  title: string
  type: ReleaseType
  authors?: string[]
  publisher?: string
  release_date?: string
  date_certainty: DateCertainty
  cover_url?: string
  source_url: string
}

export interface OpenLibraryFeed {
  source: 'openlibrary'
  items: OpenLibraryItem[]
}

export const OPEN_LIBRARY_BASE = 'https://openlibrary.org'
export const OPEN_LIBRARY_SEARCH_URL = `${OPEN_LIBRARY_BASE}/search.json`
export const OPEN_LIBRARY_COVERS_BASE = 'https://covers.openlibrary.org'
