import { useTranslation } from './i18n'
import { useCallback, useEffect, useState } from 'react'
import { isDemoMode } from './config'
import type { Category } from './types'
import { LanguageSwitch } from './components/LanguageSwitch'
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
  const { addEvent, error: calendarError, clearError } = useGoogleCalendar()

  const showGamesCalendar = category === 'games' && !hasSearched && !demoMode
  const {
    sections: calendarSections,
    loading: calendarLoading,
    warning: calendarWarning,
    error: calendarErrorState,
    reload: reloadCalendar,
  } = useGamesCalendar(showGamesCalendar)

  const handleSearch = useCallback(() => {
    void search(category, query)
  }, [category, query, search])

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
    const last = getLastParams()
    if (last) void search(last.category, last.query)
  }, [locale, getLastParams, search])

  useEffect(() => {
    if (showGamesCalendar) reloadCalendar()
  }, [locale, showGamesCalendar, reloadCalendar])

  const activeWarning = showGamesCalendar ? calendarWarning : warning
  const activeError = showGamesCalendar ? calendarErrorState : error

  return (
    <div className="relative min-h-dvh">
      <div className="pointer-events-none absolute inset-0 bg-grid" aria-hidden />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[480px] bg-[radial-gradient(ellipse_at_top,rgb(91_33_182/0.25),transparent_70%)]"
        aria-hidden
      />

      <div className="fixed right-4 top-4 z-50 sm:right-8">
        <LanguageSwitch />
      </div>

      <main className={`relative mx-auto ${CONTENT_MAX_WIDTH} space-y-8 px-4 py-8 sm:space-y-10 sm:px-8 sm:py-12 lg:space-y-12`}>
        <HeroSection />

        <SearchPanel
          category={category}
          query={query}
          loading={loading}
          onCategoryChange={handleCategoryChange}
          onQueryChange={setQuery}
          onSubmit={handleSearch}
        />

        <div className="space-y-3">
          {demoMode && <StatusBanner variant="info" message={ui.banners.demoActive} />}
          {activeWarning && !demoMode && <StatusBanner variant="warning" message={activeWarning} />}
          {activeError && <StatusBanner variant="error" message={activeError} />}
          {calendarError && (
            <StatusBanner variant="error" message={calendarError} onDismiss={clearError} />
          )}
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
