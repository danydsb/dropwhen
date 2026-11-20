import type { Category, DateCertainty } from '../types'

export type Locale = 'fr' | 'en'

export type UiMessages = {
  categories: Record<Category, string>
  header: {
    tagline: string
    demoBadge: string
  }
  hero: {
    subtitle: string
    resultsCount: (count: number) => string
  }
  gamesCalendar: {
    title: string
    subtitle: string
    todayTitle: string
    todaySubtitle: string
    upcomingLabel: string
    emptyToday: string
    emptyMonth: string
    count: (count: number) => string
  }
  search: {
    placeholder: string
    submit: string
    hint: string
    minLengthHint: (min: number) => string
  }
  empty: {
    noResults: string
    title: string
    hint: string
    hintDemo: string
  }
  card: {
    unknownDate: string
    viewSource: string
    enlargeCover: string
    copyLink: string
    linkCopied: string
    addToCalendar: string
    developer: string
    publisher: string
    released: string
  }
  dates: {
    unknown: string
    tba: string
    toConfirm: string
    untitled: string
    certainty: Record<DateCertainty, string>
  }
  banners: {
    demoActive: string
  }
  errors: {
    searchFailed: string
    unexpected: string
  }
  warnings: {
    demo: string
    rawgMissing: string
    rawgUnavailable: (detail: string) => string
    gamesCalendarEmpty: string
    comicsEmpty: string
    comicsOk: (sources: string[]) => string
    upcomingComicsUnavailable: (detail: string) => string
    queryTooShort: (min: number) => string
  }
  demo: {
    sourceRawg: string
    sourceUrbanComics: string
    multiPlatform: string
  }
  calendar: {
    addedVia: string
    category: (label: string) => string
    source: (name: string) => string
    publisher: (name: string) => string
    link: (url: string) => string
    unknownDateNote: string
  }
  comicsCalendar: {
    title: string
    intro: string
    all: string
    manga: string
    bd: string
    specialOnly: string
    count: (count: number) => string
    empty: string
    partialWarning: (sources: string) => string
  }
  content: {
    kinds: Record<'dlc' | 'expansion' | 'season' | 'patch' | 'update' | 'pack' | 'set' | 'launch', string>
    nowTitle: string
    laterTitle: string
    allGames: string
    filterLabel: string
    mythicPlusSeason: (number: string) => string
    patch: (number: string) => string
    ongoingUntil: (date: string) => string
    ongoingSince: (date: string) => string
    ongoing: string
    emptyNow: string
    emptyMonth: string
    count: (count: number) => string
    intro: string
    partialWarning: (sources: string) => string
    tftSet: (number: string, name?: string) => string
    season: (number: string) => string
    tbd: string
    tbdLong: string
    tbdSummary: string
    previewOn: (date: string) => string
    endOfYear: (year: string) => string
    poe2Launch: (league?: string) => string
    poe2LaunchSummary: (league?: string) => string
    patchNotes: string
    officialPage: string
  }
  mag: {
    issue: (monthLabel: string) => string
    mostAnticipated: string
    countdown: (days: number) => string
    countdownUnit: (days: number) => string
    addToCalendar: string
    followers: (count: number) => string
    trailer: string
    steam: string
    viewSource: (source: string) => string
    previousImage: string
    nextImage: string
    close: string
    noImages: string
    released: string
    hype: string
    openDetails: (title: string) => string
    fullRelease: string
  }
  a11y: {
    dismiss: string
    languageSwitch: string
    categorySwitch: string
    themeSwitch: string
  }
  theme: {
    light: string
    dark: string
  }
  language: {
    fr: string
    en: string
  }
}
