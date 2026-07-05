export type ReleaseType = 'comic'

export type ReleaseSource = 'urbancomics'

export interface UnifiedRelease {
  title: string
  type: ReleaseType
  series?: string
  volume?: string
  publisher?: string
  authors?: string[]
  release_date?: string
  cover_url?: string
  source_url?: string
  source: ReleaseSource
}
