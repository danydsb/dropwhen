export type {
  ReleaseSource,
  ReleaseType,
  UnifiedRelease,
} from './types'

export {
  dedupeReleases,
  fromOpenLibrary,
  fromUrbanComics,
  matchesRelease,
  toReleaseItem,
} from './normalize'

export { searchComics, upcomingDedupeKey } from './upcoming'
