export type ContentKind = 'dlc' | 'expansion' | 'season' | 'patch' | 'update' | 'pack' | 'set' | 'launch'

/** Mirror of the payload returned by /api/content-feed (api/content-feed.ts). */
export interface ContentFeedEntry {
  id: string
  source: 'riot' | 'tft' | 'blizzard' | 'ggg'
  gameKey: string
  kind: 'patch' | 'season' | 'set' | 'update' | 'launch'
  title: string
  number?: string
  name?: string
  date?: string
  /** Announced, date not published yet */
  tbd?: boolean
  /** Official presentation of the upcoming content (developer livestream…) */
  previewDate?: string
  endDate?: string
  ongoing?: boolean
  url?: string
}

export interface ForumThread {
  title: string
  url: string
}

export interface ContentFeed {
  entries: ContentFeedEntry[]
  links: {
    d4PatchNotes?: string
    wowPatchNotes?: string
    poe1PatchThreads: ForumThread[]
    poe2PatchThreads: ForumThread[]
    poe2Announcements: ForumThread[]
  }
  errors: string[]
}

export interface ManualContentEntry {
  gameKey: string
  kind: ContentKind
  title: string
  date: string
  dateFormat?: 'exact' | 'month' | 'quarter' | 'year'
  url?: string
  summary?: string
}
