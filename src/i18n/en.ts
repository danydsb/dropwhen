import type { UiMessages } from './types'

export const en: UiMessages = {
  categories: {
    games: 'Video games',
    manga: 'Manga',
    comics: 'Comics & graphic novels',
  },

  header: {
    tagline: 'Releases & calendar',
    demoBadge: 'Demo mode',
  },

  hero: {
    subtitle:
      'Track upcoming game, manga and comic releases. Add them to your calendar in one click.',
    resultsCount: (count) => `${count} result${count === 1 ? '' : 's'}`,
  },

  search: {
    placeholder: 'Search for a release…',
    submit: 'Search',
  },

  empty: {
    noResults: 'No results',
    title: 'Find your next release',
    hint: 'Run a search to browse upcoming releases.',
    hintDemo: 'Run a search or leave the field empty in demo mode to see sample results.',
  },

  card: {
    datePrefix: 'Date',
    unknownDate: 'Unknown date',
    viewSource: 'View listing',
    addToCalendar: 'Open in Google Calendar',
    developer: 'Developer',
    publisher: 'Publisher',
  },

  dates: {
    unknown: 'Unknown date',
    tba: 'Release date TBA',
    jpUnknown: 'JP release date unknown',
    frUnknown: 'FR release date unknown',
    toConfirm: 'Date to be confirmed',
    untitled: 'Untitled',
    certainty: {
      confirmed: 'Confirmed date',
      estimated: 'Estimated date',
      unknown: 'Uncertain date',
    },
  },

  banners: {
    demoActive:
      'Demo mode is on — mock data only, no API calls. Set VITE_DEMO_MODE=false in .env.local to use live sources.',
  },

  errors: {
    searchFailed: 'Search failed.',
    unexpected: 'Unexpected error.',
    popupBlocked: 'Popup blocked — allow pop-ups to open Google Calendar.',
  },

  warnings: {
    demo:
      'Demo mode is on — mock data only. Set VITE_DEMO_MODE=false in .env.local to enable live sources.',
    rawgMissing:
      'RAWG API key missing. Get one at rawg.io/apidocs or keep VITE_DEMO_MODE=true.',
    rawgUnavailable: (detail) => `RAWG unavailable (${detail}).`,
    jikanDates: 'Dates via MyAnimeList (Jikan).',
    jikanUnavailable: (detail) => `Jikan unavailable (${detail}).`,
    bdfugueEmpty: 'No BDfugue results.',
    bdfugueOk: 'Data from BDfugue (CORS proxy).',
    bdfugueUnavailable: (detail) => `BDfugue unavailable (${detail}).`,
  },

  demo: {
    sourceRawg: 'RAWG (demo)',
    sourceJikan: 'Jikan (demo)',
    sourceBdfugue: 'BDfugue (demo)',
    multiPlatform: 'Multi-platform',
  },

  calendar: {
    category: (label) => `Category: ${label}`,
    source: (name) => `Source: ${name}`,
    publisher: (name) => `Publisher / platform: ${name}`,
    link: (url) => `Listing: ${url}`,
    unknownDateNote: 'Unknown release date — event created for today.',
  },

  a11y: {
    dismiss: 'Dismiss',
    languageSwitch: 'Language',
  },

  language: {
    fr: 'FR',
    en: 'EN',
  },
}
