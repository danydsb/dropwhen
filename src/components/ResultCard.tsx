import { ui } from '../i18n'
import { CalendarPlus, Check, ExternalLink, Loader2 } from 'lucide-react'
import type { ReleaseItem } from '../types'
import { CATEGORY_STYLES } from './CategorySelector'
import { CategoryIcon } from './CategoryIcon'
import { getCertaintyLabel } from '../utils/dates'

export function ResultCard({
  item,
  onAddToCalendar,
  calendarLoading,
  calendarSuccess,
  googleConfigured,
}: {
  item: ReleaseItem
  onAddToCalendar: (item: ReleaseItem) => void
  calendarLoading: boolean
  calendarSuccess: boolean
  googleConfigured: boolean
}) {
  const styles = CATEGORY_STYLES[item.category]

  return (
    <article className={`flex flex-col overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/50 ring-1 backdrop-blur-sm ${styles.ring}`}>
      <div className="relative flex aspect-[16/10] items-center justify-center bg-gradient-to-br from-slate-800/80 via-slate-900 to-slate-950">
        <div className={`absolute inset-0 opacity-20 blur-2xl ${item.category === 'games' ? 'bg-games' : item.category === 'manga' ? 'bg-manga' : 'bg-comics'}`} />
        <CategoryIcon category={item.category} size={56} className="relative z-10" />
        <div className="absolute inset-x-0 bottom-0 z-10 flex flex-wrap gap-1.5 bg-gradient-to-t from-slate-950/90 to-transparent p-3 pt-10">
          {item.dateLocale !== 'unknown' && (
            <span className="rounded-md border border-slate-600/60 bg-slate-800/80 px-2 py-0.5 text-[11px] font-medium uppercase text-slate-300">
              {ui.card.datePrefix} {item.dateLocale.toUpperCase()}
            </span>
          )}
          {item.dateCertainty !== 'confirmed' && (
            <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] text-amber-200">
              {getCertaintyLabel(item.dateCertainty)}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="line-clamp-2 text-base font-semibold text-white">{item.title}</h3>
          <p className="mt-1 text-sm text-slate-300">{item.releaseDateLabel ?? ui.card.unknownDate}</p>
          {item.platformOrPublisher && (
            <p className="mt-0.5 text-xs text-slate-500">{item.platformOrPublisher}</p>
          )}
        </div>

        <div className="mt-auto flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
            <span className={`rounded-full border px-2 py-0.5 ${styles.badge}`}>{item.source}</span>
            {item.sourceUrl && (
              <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:underline">
                {ui.card.viewSource} <ExternalLink size={12} aria-hidden />
              </a>
            )}
          </div>
          <button
            type="button"
            disabled={calendarLoading}
            onClick={() => onAddToCalendar(item)}
            className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40 ${calendarSuccess ? 'bg-emerald-600' : styles.button}`}
          >
            {calendarLoading ? (
              <><Loader2 size={16} className="animate-spin" aria-hidden /> {ui.card.adding}</>
            ) : calendarSuccess ? (
              <><Check size={16} aria-hidden /> {ui.card.added}</>
            ) : (
              <><CalendarPlus size={16} aria-hidden /> {googleConfigured ? ui.card.addToCalendar : ui.card.calendarDemo}</>
            )}
          </button>
        </div>
      </div>
    </article>
  )
}
