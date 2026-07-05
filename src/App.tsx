import { ui } from './i18n'
import { CalendarDays, FlaskConical } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { isDemoMode } from './config'
import type { Category } from './types'
import { CategorySelector } from './components/CategorySelector'
import { SearchBar } from './components/SearchBar'
import { ResultList } from './components/ResultList'
import { StatusBanner } from './components/StatusBanner'
import { useSearch } from './hooks/useSearch'
import { useGoogleCalendar } from './hooks/useGoogleCalendar'
import { isGoogleConfigured } from './services/google-calendar'

function App() {
  const [category, setCategory] = useState<Category>('games')
  const [query, setQuery] = useState('')
  const demoMode = isDemoMode()
  const { items, warning, loading, error, hasSearched, search } = useSearch()
  const { addEvent, loadingId, successId, error: calendarError, clearError } = useGoogleCalendar()

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

  const googleConfigured = isGoogleConfigured()

  return (
    <div className="min-h-dvh bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
      <header className="border-b border-slate-800/60 bg-slate-950/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800/80 ring-1 ring-slate-700">
              <CalendarDays className="h-5 w-5 text-games-light" aria-hidden />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                {ui.header.tagline}
              </p>
              <h1 className="text-2xl font-bold text-white">
                Drop<span className="text-slate-400">When</span>
              </h1>
            </div>
          </div>
          {demoMode && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-200">
              <FlaskConical size={14} aria-hidden />
              {ui.header.demoBadge}
            </span>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        <section className="space-y-4">
          <CategorySelector value={category} onChange={handleCategoryChange} />
          <SearchBar query={query} loading={loading} onQueryChange={setQuery} onSubmit={handleSearch} />
        </section>

        {demoMode && <StatusBanner variant="info" message={ui.banners.demoActive} />}

        {!demoMode && !googleConfigured && (
          <StatusBanner variant="warning" message={ui.banners.googleNotConfigured} />
        )}

        {warning && !demoMode && <StatusBanner variant="warning" message={warning} />}
        {error && <StatusBanner variant="error" message={error} />}
        {calendarError && (
          <StatusBanner variant="error" message={calendarError} onDismiss={clearError} />
        )}

        <ResultList
          items={items}
          loading={loading}
          hasSearched={hasSearched}
          onAddToCalendar={(item) => void addEvent(item)}
          calendarLoadingId={loadingId}
          calendarSuccessId={successId}
          googleConfigured={googleConfigured}
        />
      </main>
    </div>
  )
}

export default App
