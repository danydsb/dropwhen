import type { Category } from '../types'
import { getIntlLocale, getMessages } from './messages'
import type { Locale, UiMessages } from './types'

const STORAGE_KEY = 'dropwhen-locale'

let currentLocale: Locale = readStoredLocale()

function readStoredLocale(): Locale {
  if (typeof window === 'undefined') return 'fr'
  const stored = window.localStorage.getItem(STORAGE_KEY)
  return stored === 'en' ? 'en' : 'fr'
}

export function getLocale(): Locale {
  return currentLocale
}

export function setLocale(locale: Locale): void {
  currentLocale = locale
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, locale)
    document.documentElement.lang = locale
  }
}

export function getUi(): UiMessages {
  return getMessages(currentLocale)
}

export function getCategoryLabel(category: Category): string {
  return getUi().categories[category]
}

export { getIntlLocale }
