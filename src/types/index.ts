export type Category = 'games' | 'comics' | 'content'

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
  /** Extra visuals (screenshots, artworks) shown in the detail gallery */
  images?: string[]
  /** Wide artwork used for hero banners */
  artworkUrl?: string
  summary?: string
  trailerUrl?: string
  /** Store page preferred over the source listing when available */
  steamUrl?: string
  /** Base game of a DLC / season / patch (content tab) */
  parentTitle?: string
  /** Content still running (current season, latest update) */
  ongoing?: boolean
  /** Patch notes (or most relevant official article) — shown as the main link */
  notesUrl?: string
  /** Label of the `notesUrl` button (defaults to "Patch notes") */
  notesLabel?: string
  /** Manga or BD (French comics calendar) */
  bookKind?: 'manga' | 'bd'
  /** Special edition flag detected in the title (Collector, Prestige, Deluxe…) */
  specialEdition?: string
  /** Kind of content (content tab only) */
  contentKind?: 'dlc' | 'expansion' | 'season' | 'patch' | 'update' | 'pack' | 'set' | 'launch'
  /** End of a season, when known (ISO date) */
  endDate?: string
  /** IGDB follows before release — popularity signal */
  hypes?: number
  source: string
  sourceUrl?: string
  category: Category
}

export interface SearchResult {
  items: ReleaseItem[]
  warning?: string
}
