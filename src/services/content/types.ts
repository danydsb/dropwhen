export type ContentKind = 'dlc' | 'expansion' | 'season' | 'patch' | 'update' | 'pack' | 'set' | 'launch'

/** Mirror of the payload returned by /api/content-feed (api/content-feed.ts). */
export interface ContentFeedEntry {
  id: string
  source: 'riot' | 'tft' | 'raiderio' | 'blizzard'
  gameKey: string
  kind: 'patch' | 'season' | 'set' | 'update'
  title: string
  number?: string
  name?: string
  date?: string
  dateEstimated?: boolean
  estimatedFromPatch?: string
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
  poe2Leagues: { current?: string; upcoming?: string }
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
