import type { ManualContentEntry } from '../services/content/types'

/**
 * Hand-written entries for content no API announces (e.g. Path of Exile 2 leagues:
 * not in IGDB, and GGG's API only lists leagues once they are live).
 *
 * Example:
 * {
 *   gameKey: 'poe2',
 *   kind: 'season',
 *   title: 'Forbidden Rites',
 *   date: '2026-12-11',          // YYYY-MM-DD
 *   dateFormat: 'exact',          // or 'month' / 'quarter' / 'year'
 *   url: 'https://pathofexile2.com',
 * }
 */
export const MANUAL_CONTENT: ManualContentEntry[] = []
