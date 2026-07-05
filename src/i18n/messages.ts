import { en } from './en'
import { fr } from './fr'
import type { Locale, UiMessages } from './types'

const MESSAGES: Record<Locale, UiMessages> = { fr, en }

export function getMessages(locale: Locale): UiMessages {
  return MESSAGES[locale]
}

export function getIntlLocale(locale: Locale): string {
  return locale === 'fr' ? 'fr-FR' : 'en-US'
}
