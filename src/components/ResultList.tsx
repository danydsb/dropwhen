import { ui } from '../i18n'
import { CalendarSearch, SearchX } from 'lucide-react'
import type { ReleaseItem } from '../types'
import { ResultCard } from './ResultCard'

export function ResultList({
  items,
  loading,
  hasSearched,
  onAddToCalendar,
  calendarLoadingId,
  calendarSuccessId,
  googleConfigured,
}: {
  items: ReleaseItem[]
  loading: boolean
  hasSearched: boolean
  onAddToCalendar: (item: ReleaseItem) => void
  calendarLoadingId: string | null
  calendarSuccessId: string | null
  googleConfigured: boolean
}) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-2xl border border-slate-800 bg-slate-900/40">
            <div className="aspect-[16/10] bg-slate-800" />
            <div className="space-y-3 p-4">
              <div className="h-4 rounded bg-slate-800" />
              <div className="h-10 rounded-xl bg-slate-800" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (hasSearched && items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-700 px-6 py-12 text-center">
        <SearchX className="mx-auto mb-3 h-10 w-10 text-slate-600" aria-hidden />
        <p className="text-lg font-medium text-slate-300">{ui.empty.noResults}</p>
      </div>
    )
  }

  if (!hasSearched) {
    return (
      <div className="rounded-2xl border border-slate-800/60 px-6 py-14 text-center">
        <CalendarSearch className="mx-auto mb-4 h-12 w-12 text-slate-600" aria-hidden />
        <p className="text-lg font-medium text-slate-300">{ui.empty.title}</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{ui.empty.hint}</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <ResultCard
          key={item.id}
          item={item}
          onAddToCalendar={onAddToCalendar}
          calendarLoading={calendarLoadingId === item.id}
          calendarSuccess={calendarSuccessId === item.id}
          googleConfigured={googleConfigured}
        />
      ))}
    </div>
  )
}
