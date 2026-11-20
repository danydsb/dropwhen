/**
 * Games followed in the "Content & seasons" tab.
 * Add a game here: its DLC / expansions and visuals come from IGDB (via `igdbIds`).
 * Seasons, sets, patches and launches come from the publishers' official pages
 * (Riot, Blizzard, Grinding Gear Games), wired by `key` in api/content-feed.ts.
 */
export interface TrackedGame {
  key: string
  name: string
  /** IGDB id of the base game (DLC, seasons and covers are fetched from it) */
  igdbIds: number[]
}

export const TRACKED_GAMES: TrackedGame[] = [
  { key: 'poe', name: 'Path of Exile', igdbIds: [1911] },
  { key: 'poe2', name: 'Path of Exile 2', igdbIds: [125642] },
  { key: 'd4', name: 'Diablo IV', igdbIds: [125165] },
  { key: 'wow', name: 'World of Warcraft', igdbIds: [123] },
  { key: 'wow-forever', name: 'World of Warcraft: Forever', igdbIds: [417650] },
  { key: 'sf6', name: 'Street Fighter 6', igdbIds: [191692] },
  { key: 'fatal-fury', name: 'Fatal Fury: City of the Wolves', igdbIds: [260321] },
  { key: 'lol', name: 'League of Legends', igdbIds: [115] },
  { key: 'tft', name: 'Teamfight Tactics', igdbIds: [120176] },
]
