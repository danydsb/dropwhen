import { useTranslation } from './i18n'
import { useCallback, useEffect, useState } from 'react'
import { getMinSearchQueryLength, isDemoMode } from './config'
import type { Category } from './types'
import { LanguageSwitch } from './components/LanguageSwitch'
import { ThemeSwitch } from './components/ThemeSwitch'
import { RelaxBackground } from './components/RelaxBackground'
import { ToastyEasterEgg } from './components/ToastyEasterEgg'
import { HeroSection } from './components/HeroSection'
import { SearchPanel } from './components/SearchPanel'
import { ResultList } from './components/ResultList'
import { GamesCalendar } from './components/GamesCalendar'
import { StatusBanner } from './components/StatusBanner'
import { useSearch } from './hooks/useSearch'
import { useGamesCalendar } from './hooks/useGamesCalendar'
import { useGoogleCalendar } from './hooks/useGoogleCalendar'
import { CONTENT_MAX_WIDTH } from './lib/layout'

function App() {
  const { ui, locale } = useTranslation()
  const [category, setCategory] = useState<Category>('games')
  const [query, setQuery] = useState('')
  const demoMode = isDemoMode()
  const { items, warning, loading, error, hasSearched, search, clear, getLastParams } = useSearch()
  const { addEvent } = useGoogleCalendar()

  const showGamesCalendar = category === 'games' && !hasSearched && !demoMode
  const {
    sections: calendarSections,
    loading: calendarLoading,
    warning: calendarWarning,
    error: calendarErrorState,
    reload: reloadCalendar,
  } = useGamesCalendar(showGamesCalendar)

  const handleCategoryChange = useCallback(
    (next: Category) => {
      setCategory(next)
      setQuery('')
      clear()
    },
    [clear],
  )

  useEffect(() => {
    if (demoMode) void search('games', '')
  }, [demoMode, search])

  useEffect(() => {
    if (demoMode) return

    const trimmed = query.trim()
    if (!trimmed) {
      clear()
      return
    }

    const minLength = getMinSearchQueryLength(category)
    if (trimmed.length < minLength) return

    const timeout = window.setTimeout(() => {
      void search(category, trimmed)
    }, 550)

    return () => window.clearTimeout(timeout)
  }, [category, clear, demoMode, query, search])

  useEffect(() => {
    const last = getLastParams()
    if (last) void search(last.category, last.query)
  }, [locale, getLastParams, search])

  useEffect(() => {
    if (showGamesCalendar) reloadCalendar()
  }, [locale, showGamesCalendar, reloadCalendar])

  const activeWarning = showGamesCalendar ? calendarWarning : warning
  const activeError = showGamesCalendar ? calendarErrorState : error

  return (
    <div className="bg-background text-foreground relative min-h-dvh">
      <RelaxBackground />
      <ToastyEasterEgg />

      <div className="fixed top-4 left-4 z-50 sm:left-8">
        <LanguageSwitch />
      </div>

      <div className="fixed top-4 right-4 z-50 sm:right-8">
        <ThemeSwitch />
      </div>

      <main className={`relative mx-auto ${CONTENT_MAX_WIDTH} space-y-6 px-4 py-8 sm:space-y-8 sm:px-8 sm:py-12 lg:space-y-10`}>
        <HeroSection />

        <SearchPanel
          category={category}
          query={query}
          onCategoryChange={handleCategoryChange}
          onQueryChange={setQuery}
        />

        <div className="space-y-3">
          {demoMode && <StatusBanner variant="info" message={ui.banners.demoActive} />}
          {activeWarning && !demoMode && <StatusBanner variant="warning" message={activeWarning} />}
          {activeError && <StatusBanner variant="error" message={activeError} />}
        </div>

        {showGamesCalendar ? (
          <GamesCalendar
            sections={calendarSections}
            loading={calendarLoading}
            onAddToCalendar={addEvent}
          />
        ) : (
          <ResultList
            items={items}
            loading={loading}
            hasSearched={hasSearched}
            isDemoMode={demoMode}
            onAddToCalendar={addEvent}
          />
        )}
      </main>
    </div>
  )
}

export default App
