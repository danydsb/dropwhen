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
  search: {
    placeholder: string
    submit: string
  }
  empty: {
    noResults: string
    title: string
    hint: string
    hintDemo: string
  }
  card: {
    datePrefix: string
    unknownDate: string
    viewSource: string
    addToCalendar: string
    developer: string
    publisher: string
  }
  dates: {
    unknown: string
    tba: string
    jpUnknown: string
    frUnknown: string
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
    popupBlocked: string
  }
  warnings: {
    demo: string
    rawgMissing: string
    rawgUnavailable: (detail: string) => string
    jikanDates: string
    jikanUnavailable: (detail: string) => string
    bdfugueEmpty: string
    bdfugueOk: string
    bdfugueUnavailable: (detail: string) => string
  }
  demo: {
    sourceRawg: string
    sourceJikan: string
    sourceBdfugue: string
    multiPlatform: string
  }
  calendar: {
    category: (label: string) => string
    source: (name: string) => string
    publisher: (name: string) => string
    link: (url: string) => string
    unknownDateNote: string
  }
  a11y: {
    dismiss: string
    languageSwitch: string
  }
  language: {
    fr: string
    en: string
  }
}

