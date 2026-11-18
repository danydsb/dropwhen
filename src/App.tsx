import { useTranslation } from './i18n'
import { useCallback, useEffect, useState } from 'react'
import { getMinSearchQueryLength, isDemoMode } from './config'
import type { Category, ReleaseItem } from './types'
import { LanguageSwitch } from './components/LanguageSwitch'
import { ReleaseDetail } from './components/ReleaseDetail'
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
  const [selected, setSelected] = useState<ReleaseItem | null>(null)
  const closeDetail = useCallback(() => setSelected(null), [])

  const showGamesCalendar = category === 'games' && !hasSearched && !demoMode
  const {
    todayItems: calendarTodayItems,
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
    <div className="relative min-h-dvh">
      <ToastyEasterEgg />

      <main className={`relative mx-auto ${CONTENT_MAX_WIDTH} px-4 pt-14 pb-20 sm:px-6 sm:pt-8`}>
        <div className="absolute top-4 right-4 z-10 sm:static sm:mb-4 sm:flex sm:justify-end">
          <LanguageSwitch />
        </div>

        <HeroSection />

        <SearchPanel
          category={category}
          query={query}
          onCategoryChange={handleCategoryChange}
          onQueryChange={setQuery}
        />

        <div className="mt-4 space-y-3 empty:hidden">
          {demoMode && <StatusBanner variant="info" message={ui.banners.demoActive} />}
          {activeWarning && !demoMode && <StatusBanner variant="warning" message={activeWarning} />}
          {activeError && <StatusBanner variant="error" message={activeError} />}
        </div>

        {showGamesCalendar ? (
          <GamesCalendar
            todayItems={calendarTodayItems}
            sections={calendarSections}
            loading={calendarLoading}
            onOpen={setSelected}
            onAddToCalendar={addEvent}
          />
        ) : (
          <ResultList
            items={items}
            loading={loading}
            hasSearched={hasSearched}
            isDemoMode={demoMode}
            onOpen={setSelected}
          />
        )}
        <footer className="mt-20 text-center text-[11px] font-semibold tracking-widest text-(--mag-muted) uppercase opacity-70">
          © {new Date().getFullYear()} FC MOUCHE
        </footer>
      </main>

      <ReleaseDetail item={selected} onClose={closeDetail} onAddToCalendar={addEvent} />
    </div>
  )
}

export default App
