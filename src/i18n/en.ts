import type { UiMessages } from './types'

export const en: UiMessages = {
  categories: {
    games: 'Video games',
    comics: 'Comics & graphic novels',
  },

  header: {
    tagline: 'Releases & calendar',
    demoBadge: 'Demo mode',
  },

  hero: {
    subtitle:
      'Discover upcoming video games and comics releases. Add them to your calendar in one click.',
    resultsCount: (count) => `${count} result${count === 1 ? '' : 's'}`,
  },

  gamesCalendar: {
    title: 'Video games release calendar',
    subtitle: 'Next 6 months via IGDB',
    emptyMonth: 'No releases scheduled this month.',
    count: (count) => `${count} game${count === 1 ? '' : 's'}`,
  },

  search: {
    placeholder: 'Search for a release…',
    submit: 'Search',
    hint: 'Press Enter or click Search.',
    minLengthHint: (min) => `Enter at least ${min} characters to search.`,
  },

  empty: {
    noResults: 'No results',
    title: 'Find your next release',
    hint: 'Run a search to browse upcoming releases.',
    hintDemo: 'Run a search or leave the field empty in demo mode to see sample results.',
  },

  card: {
    unknownDate: 'Unknown date',
    viewSource: 'View listing',
    addToCalendar: 'Add',
    developer: 'Developer',
    publisher: 'Publisher',
    released: 'Already released',
  },

  dates: {
    unknown: 'Unknown date',
    tba: 'Release date TBA',
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
  },

  warnings: {
    demo:
      'Demo mode is on — mock data only. Set VITE_DEMO_MODE=false in .env.local to enable live sources.',
    rawgMissing:
      'IGDB configuration missing. Set IGDB_CLIENT_ID and IGDB_CLIENT_SECRET on the server.',
    rawgUnavailable: (detail) => `IGDB unavailable (${detail}).`,
    gamesCalendarEmpty: 'No upcoming games in the next 6 months.',
    comicsEmpty: 'No comics or graphic novels found.',
    comicsOk: (sources) => `Results via ${sources.join(', ')}.`,
    upcomingComicsUnavailable: (detail) => `BD/comics sources unavailable (${detail}).`,
    queryTooShort: (min) => `Search too short — enter at least ${min} characters.`,
  },

  demo: {
    sourceRawg: 'IGDB (demo)',
    sourceUrbanComics: 'Urban Comics (demo)',
    multiPlatform: 'Multi-platform',
  },

  calendar: {
    addedVia: 'Added via DropWhen',
    category: (label) => `Category: ${label}`,
    source: (name) => `Source: ${name}`,
    publisher: (name) => `Publisher / platform: ${name}`,
    link: (url) => `Listing: ${url}`,
    unknownDateNote: 'Unknown release date — event created for today.',
  },

  a11y: {
    dismiss: 'Dismiss',
    languageSwitch: 'Language',
    categorySwitch: 'Category',
    themeSwitch: 'Theme',
  },

  theme: {
    light: 'Light',
    dark: 'Dark',
  },

  language: {
    fr: 'FR',
    en: 'EN',
  },
}
