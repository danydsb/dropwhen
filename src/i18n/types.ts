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
    emptyMonth: string
    count: (count: number) => string
  }
  search: {
    placeholder: string
    submit: string
    hint: string
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
    addToCalendar: string
    developer: string
    publisher: string
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
    upcomingComicsEmpty: string
    upcomingComicsOk: (sources: string[]) => string
    upcomingComicsUnavailable: (detail: string) => string
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
