import { useTranslation } from '../i18n'
import { CalendarDays } from 'lucide-react'
import { UPCOMING_MONTH_COUNT } from '../utils/calendar-months'
import { CATEGORY_GRADIENTS } from '../lib/category-gradients'
import type { ReleaseItem } from '../types'
import { ResultCard } from './ResultCard'

function MonthSkeleton() {
  return (
    <div className="space-y-3">
      <div className="h-6 w-40 animate-pulse rounded-lg bg-slate-800" />
      {Array.from({ length: 2 }).map((_, index) => (
        <div
          key={index}
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

export function GamesCalendar({
  sections,
  loading,
  onAddToCalendar,
}: {
  sections: Array<{ month: { key: string; label: string }; items: ReleaseItem[] }>
  loading: boolean
  onAddToCalendar: (item: ReleaseItem) => void
}) {
  const { ui } = useTranslation()
  const gradient = CATEGORY_GRADIENTS.games

  if (loading) {
    return (
      <section className="space-y-8">
        <header className="space-y-1">
          <div className="h-6 w-48 animate-pulse rounded-lg bg-slate-800" />
          <div className="h-4 w-64 animate-pulse rounded bg-slate-800/80" />
        </header>
        {Array.from({ length: UPCOMING_MONTH_COUNT }).map((_, index) => (
          <MonthSkeleton key={index} />
        ))}
      </section>
    )
  }

  return (
    <section className="space-y-8">
      <header className="space-y-1">
        <div className="flex items-center gap-2">
          <CalendarDays size={18} className="text-violet-400" aria-hidden />
          <h2 className="text-lg font-semibold text-white">{ui.gamesCalendar.title}</h2>
        </div>
        <p className="text-sm text-slate-500">{ui.gamesCalendar.subtitle}</p>
      </header>

      {sections.map(({ month, items }) => (
        <div key={month.key} className="space-y-3">
          <div className="flex items-center gap-3">
            <div
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})` }}
              aria-hidden
            />
            <h3 className="text-base font-semibold capitalize text-slate-200">{month.label}</h3>
            <span className="text-xs text-slate-500">
              {ui.gamesCalendar.count(items.length)}
            </span>
          </div>

          {items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-700/60 bg-slate-900/20 px-4 py-6 text-center text-sm text-slate-500">
              {ui.gamesCalendar.emptyMonth}
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <ResultCard key={item.id} item={item} onAddToCalendar={onAddToCalendar} />
              ))}
            </div>
          )}
        </div>
      ))}
    </section>
  )
}
