import { useTranslation } from '../i18n'
import { CalendarPlus, ExternalLink } from 'lucide-react'
import type { ReleaseItem } from '../types'
import { CATEGORY_GRADIENTS } from '../lib/category-gradients'
import { CategoryIcon } from './CategoryIcon'
import { getCertaintyLabel } from '../utils/dates'

export function ResultCard({
  item,
  onAddToCalendar,
}: {
  item: ReleaseItem
  onAddToCalendar: (item: ReleaseItem) => void
}) {
  const { ui } = useTranslation()
  const gradient = CATEGORY_GRADIENTS[item.category]

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-white/8 bg-slate-900/60 transition-colors hover:border-white/15 hover:bg-slate-900/80">
      <div
        className="absolute inset-y-0 left-0 w-1"
        style={{ background: `linear-gradient(to bottom, ${gradient.from}, ${gradient.to})` }}
        aria-hidden
      />

      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-5 sm:p-5">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl sm:h-[72px] sm:w-[72px]">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.title}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${gradient.from}22, ${gradient.to}11)` }}
            >
              <CategoryIcon category={item.category} size={32} />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-start gap-2">
            <h3 className="line-clamp-2 text-base font-semibold text-white sm:line-clamp-1">
              {item.title}
            </h3>
            {item.dateCertainty !== 'confirmed' && (
              <span className="shrink-0 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-200">
                {getCertaintyLabel(item.dateCertainty)}
              </span>
            )}
          </div>

          <p className="text-sm font-medium text-slate-300">
            {item.releaseDateLabel ?? ui.card.unknownDate}
          </p>

          {item.platformOrPublisher && (
            <p className="text-xs text-slate-500">{item.platformOrPublisher}</p>
          )}

          {item.genres && item.genres.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {item.genres.map((genre) => (
                <span
                  key={genre}
                  className="rounded-md border border-slate-700/80 bg-slate-800/60 px-2 py-0.5 text-[10px] font-medium text-slate-300"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}

          {(item.developer || item.publisher) && (
            <div className="space-y-0.5 text-xs text-slate-500">
              {item.developer && (
                <p>
                  <span className="text-slate-400">{ui.card.developer} :</span> {item.developer}
                </p>
              )}
              {item.publisher && (
                <p>
                  <span className="text-slate-400">{ui.card.publisher} :</span> {item.publisher}
                </p>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
            <span
              className="rounded-full px-2 py-0.5 font-medium"
              style={{
                color: gradient.to,
                backgroundColor: `${gradient.from}22`,
                border: `1px solid ${gradient.from}44`,
              }}
            >
              {item.source}
            </span>
            {item.sourceUrl && (
              <a
                href={item.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:text-slate-300"
              >
                {ui.card.viewSource}
                <ExternalLink size={11} aria-hidden />
              </a>
            )}
          </div>
        </div>

        <div className="shrink-0 sm:w-32">
          <button
            type="button"
            onClick={() => onAddToCalendar(item)}
            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})` }}
          >
            <CalendarPlus size={15} aria-hidden />
            <span className="truncate">{ui.card.addToCalendar}</span>
          </button>
        </div>
      </div>
    </article>
  )
}
