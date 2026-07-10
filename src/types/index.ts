export type Category = 'games' | 'comics'

export type DateCertainty = 'confirmed' | 'estimated' | 'unknown'

export interface ReleaseItem {
  id: string
  title: string
  releaseDate?: string
  releaseDateLabel?: string
  dateCertainty: DateCertainty
  isReleased?: boolean
  platformOrPublisher?: string
  genres?: string[]
  developer?: string
  publisher?: string
  imageUrl?: string
  /** IGDB type label (e.g. DLC, Pack / Addon) — omitted for main games */
  gameTypeLabel?: string
  /** IGDB game_type.id for per-type color styling */
  gameTypeId?: number
  source: string
  sourceUrl?: string
  category: Category
}

export interface SearchResult {
  items: ReleaseItem[]
  warning?: string
}
