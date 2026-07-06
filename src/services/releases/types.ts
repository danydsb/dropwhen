export type ReleaseType = 'comic'

export type ReleaseSource = 'urbancomics' | 'openlibrary'

export interface UnifiedRelease {
  title: string
  type: ReleaseType
  series?: string
  volume?: string
  publisher?: string
  authors?: string[]
  release_date?: string
  date_certainty?: 'confirmed' | 'estimated' | 'unknown'
  cover_url?: string
  source_url?: string
  source: ReleaseSource
}
