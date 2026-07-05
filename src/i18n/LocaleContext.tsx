import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { getIntlLocale, getMessages } from './messages'
import { getLocale as readLocale, setLocale as persistLocale } from './store'
import type { Locale, UiMessages } from './types'

interface LocaleContextValue {
  locale: Locale
  ui: UiMessages
  intlLocale: string
  setLocale: (locale: Locale) => void
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(readLocale)

  const setLocale = useCallback((next: Locale) => {
    persistLocale(next)
    document.documentElement.lang = next
    setLocaleState(next)
  }, [])

  const value = useMemo(
    () => ({
      locale,
      ui: getMessages(locale),
      intlLocale: getIntlLocale(locale),
      setLocale,
    }),
    [locale, setLocale],
  )

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useTranslation(): LocaleContextValue {
  const context = useContext(LocaleContext)
  if (!context) {
    throw new Error('useTranslation must be used within LocaleProvider')
  }
  return context
}
