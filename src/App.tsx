import { useTranslation } from './i18n'
import { useCallback, useEffect, useState } from 'react'
import { isDemoMode } from './config'
import type { Category } from './types'
import { AppHeader } from './components/AppHeader'
import { HeroSection } from './components/HeroSection'
import { SearchPanel } from './components/SearchPanel'
import { ResultList } from './components/ResultList'
import { StatusBanner } from './components/StatusBanner'
import { useSearch } from './hooks/useSearch'
import { useGoogleCalendar } from './hooks/useGoogleCalendar'

function App() {
  const { ui, locale } = useTranslation()
  const [category, setCategory] = useState<Category>('games')
  const [query, setQuery] = useState('')
  const demoMode = isDemoMode()
  const { items, warning, loading, error, hasSearched, search } = useSearch()
  const { addEvent, error: calendarError, clearError } = useGoogleCalendar()

  const handleSearch = useCallback(() => {
    void search(category, query)
  }, [category, query, search])

  const handleCategoryChange = useCallback(
    (next: Category) => {
      setCategory(next)
      void search(next, query)
    },
    [query, search],
  )

  useEffect(() => {
    if (demoMode) void search('games', '')
  }, [demoMode, search])

  useEffect(() => {
    if (hasSearched) void search(category, query)
  }, [locale, hasSearched, category, query, search])

  return (
    <div className="relative min-h-dvh">
      <div className="pointer-events-none absolute inset-0 bg-grid" aria-hidden />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[480px] bg-[radial-gradient(ellipse_at_top,rgb(91_33_182/0.25),transparent_70%)]"
        aria-hidden
      />

      <AppHeader demoMode={demoMode} />

      <main className="relative mx-auto max-w-3xl space-y-8 px-4 py-8 sm:px-6 sm:py-12">
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
          {warning && !demoMode && <StatusBanner variant="warning" message={warning} />}
          {error && <StatusBanner variant="error" message={error} />}
          {calendarError && (
            <StatusBanner variant="error" message={calendarError} onDismiss={clearError} />
          )}
        </div>

        <ResultList
          items={items}
          loading={loading}
          hasSearched={hasSearched}
          isDemoMode={demoMode}
          onAddToCalendar={addEvent}
        />
      </main>
    </div>
  )
}

export default App
