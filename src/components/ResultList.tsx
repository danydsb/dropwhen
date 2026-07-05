import { useTranslation } from '../i18n'
import { CalendarSearch, SearchX, Sparkles } from 'lucide-react'
import type { ReleaseItem } from '../types'
import { ResultCard } from './ResultCard'

export function ResultList({
  items,
  loading,
  hasSearched,
  isDemoMode,
  onAddToCalendar,
}: {
  items: ReleaseItem[]
  loading: boolean
  hasSearched: boolean
  isDemoMode: boolean
  onAddToCalendar: (item: ReleaseItem) => void
}) {
  const { ui } = useTranslation()

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex animate-pulse gap-4 rounded-2xl border border-white/5 bg-slate-900/40 p-5"
          >
            <div className="h-16 w-16 shrink-0 rounded-xl bg-slate-800" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-2/3 rounded bg-slate-800" />
              <div className="h-3 w-1/3 rounded bg-slate-800" />
              <div className="h-9 w-36 rounded-xl bg-slate-800" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (hasSearched && items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-700/80 bg-slate-900/30 px-6 py-14 text-center">
        <SearchX className="mx-auto mb-3 h-10 w-10 text-slate-600" aria-hidden />
        <p className="text-lg font-semibold text-slate-300">{ui.empty.noResults}</p>
        <p className="mt-1 text-sm text-slate-500">{ui.search.placeholder}</p>
      </div>
    )
  }

  if (!hasSearched) {
    return (
      <div className="rounded-2xl border border-white/8 bg-slate-900/30 px-6 py-16 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800/80">
          <CalendarSearch className="h-7 w-7 text-violet-400" aria-hidden />
        </div>
        <p className="text-lg font-semibold text-white">{ui.empty.title}</p>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
          {isDemoMode ? ui.empty.hintDemo : ui.empty.hint}
        </p>
      </div>
    )
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <Sparkles size={14} className="text-violet-400" aria-hidden />
        <span>{ui.hero.resultsCount(items.length)}</span>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <ResultCard key={item.id} item={item} onAddToCalendar={onAddToCalendar} />
        ))}
      </div>
    </section>
  )
}
