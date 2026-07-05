export type Category = 'games' | 'manga' | 'comics'

export type DateLocale = 'jp' | 'fr' | 'en' | 'unknown'

export type DateCertainty = 'confirmed' | 'estimated' | 'unknown'

export interface ReleaseItem {
  id: string
  title: string
  releaseDate?: string
  releaseDateLabel?: string
  dateCertainty: DateCertainty
  dateLocale: DateLocale
  platformOrPublisher?: string
  source: string
  sourceUrl?: string
  category: Category
}

export interface SearchResult {
  items: ReleaseItem[]
  warning?: string
}
