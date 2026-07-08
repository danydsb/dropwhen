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
  /**
   * Ratio image (width / height) pour préserver l'aspect en UI.
   * Ex: 264/374 ~= 0.71.
   */
  imageAspectRatio?: number
  /** Type IGDB (ex. DLC, Pack / Addon) — absent pour un jeu principal */
  gameTypeLabel?: string
  /** ID IGDB (game_type.id) pour permettre un rendu couleur par type */
  gameTypeId?: number
  source: string
  sourceUrl?: string
  category: Category
}

export interface SearchResult {
  items: ReleaseItem[]
  warning?: string
}
