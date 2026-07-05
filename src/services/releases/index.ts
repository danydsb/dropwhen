export type {
  ReleaseSource,
  ReleaseType,
  UnifiedRelease,
} from './types'

export {
  dedupeReleases,
  fromUrbanComics,
  matchesRelease,
  toReleaseItem,
} from './normalize'

export { searchComics, upcomingDedupeKey } from './upcoming'
