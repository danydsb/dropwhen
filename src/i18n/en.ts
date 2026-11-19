import type { UiMessages } from './types'

export const en: UiMessages = {
  categories: {
    games: 'Video games',
    comics: 'Comics & graphic novels',
    content: 'Content & seasons',
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
    subtitle: 'Anticipated games for the next 6 months (AAA, AA and followed indies) via IGDB',
    todayTitle: 'Out today',
    todaySubtitle: 'Games releasing today',
    upcomingLabel: 'Coming up',
    emptyToday: 'No releases scheduled for today.',
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
    enlargeCover: 'Enlarge cover',
    copyLink: 'Copy link',
    linkCopied: 'Link copied!',
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

  comicsCalendar: {
    title: 'Coming soon in France',
    intro:
      'Upcoming French comics and manga announced by publishers (Glénat for now), over the next three months. Type a title to also search the other sources.',
    all: 'All',
    manga: 'Manga',
    bd: 'Comics',
    specialOnly: 'Special editions',
    count: (count) => `${count} release${count === 1 ? '' : 's'}`,
    empty: 'Nothing announced for this filter.',
    partialWarning: (sources) => `Some publishers are unavailable right now (${sources}).`,
  },

  content: {
    kinds: {
      dlc: 'DLC',
      expansion: 'Expansion',
      season: 'Season',
      patch: 'Patch',
      update: 'Update',
      pack: 'Pack',
      set: 'Set',
      launch: 'Launch',
    },
    nowTitle: 'Right now',
    laterTitle: 'Later',
    allGames: 'All',
    filterLabel: 'Filter by game',
    mythicPlusSeason: (number) => `Mythic+ · Season ${number}`,
    patch: (number) => `Patch ${number}`,
    ongoingUntil: (date) => `Running until ${date}`,
    ongoingSince: (date) => `Running since ${date}`,
    ongoing: 'Running',
    emptyNow: 'Nothing new in the last few weeks.',
    emptyMonth: 'Nothing announced yet.',
    count: (count) => `${count} item${count === 1 ? '' : 's'}`,
    intro:
      'Seasons, DLC, expansions and patches for the games we follow. Publishers often announce seasons only a few weeks ahead, so far-off months fill up over time.',
    partialWarning: (sources) => `Some sources are unavailable right now (${sources}).`,
    tftSet: (number, name) => (name ? `Set ${number} · ${name}` : `Set ${number}`),
    estimatedFromPatch: (patch) =>
      `Estimated date: sets launch with a big patch, most likely patch ${patch} (official Riot schedule).`,
    endOfYear: (year) => `Late ${year}`,
    poe2Launch: (league) => (league ? `Version 1.0 · ${league}` : 'Version 1.0'),
    poe2LaunchSummary: (league) =>
      league
        ? `Version 1.0 launch, with the new “${league}” league.`
        : 'Version 1.0 launch, with a new league.',
    patchNotes: 'Patch notes',
    officialPage: 'Official page',
  },

  mag: {
    issue: (monthLabel) => `Issue ${monthLabel}`,
    mostAnticipated: 'Most anticipated right now',
    countdown: (days) => (days <= 0 ? 'D-Day' : `D-${days}`),
    countdownUnit: (days) => (days === 1 ? 'tomorrow!' : days <= 0 ? 'today!' : 'days'),
    addToCalendar: 'Add to my calendar',
    followers: (count) => `${count} player${count === 1 ? ' is' : 's are'} waiting on IGDB`,
    trailer: 'Trailer',
    steam: 'Steam page',
    viewSource: (source) => `${source} page`,
    previousImage: 'Previous image',
    nextImage: 'Next image',
    close: 'Close',
    noImages: 'No images yet for this one.',
    released: 'Out',
    hype: 'hype!!',
    openDetails: (title) => `Open details for ${title}`,
    fullRelease: '1.0 release',
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
