import { useTranslation } from '../i18n'
import type { ReleaseItem } from '../types'
import { daysUntil, formatShortDate } from '../utils/dates'
import { CategoryIcon } from './CategoryIcon'

/** Hype level from which a game gets the "hype !!" sticker. */
export const HYPE_STICKER_THRESHOLD = 100

export function getDateTag(item: ReleaseItem): { label: string; exact: boolean } {
  if (item.dateCertainty === 'confirmed' && item.releaseDate) {
    const short = formatShortDate(item.releaseDate) ?? ''
    // Day/month alone is only unambiguous for releases in the coming year.
    const days = daysUntil(item.releaseDate)
    const nearFuture = days !== undefined && days >= -30 && days <= 365
    return { label: nearFuture ? short : `${short}/${item.releaseDate.slice(2, 4)}`, exact: true }
  }
  return { label: item.releaseDateLabel ?? 'TBA', exact: false }
}

export function ReleaseCard({
  item,
  onOpen,
}: {
  item: ReleaseItem
  onOpen: (item: ReleaseItem) => void
}) {
  const { ui } = useTranslation()
  const tag = getDateTag(item)
  const subtitle = item.developer ?? item.publisher ?? item.genres?.join(', ')

  return (
    <button
      type="button"
      onClick={() => onOpen(item)}
      className="mag-card relative flex w-full cursor-pointer flex-col justify-start text-left"
      aria-label={ui.mag.openDetails(item.title)}
    >
      <div className="aspect-3/4 w-full overflow-hidden border-b-3 border-(--mag-ink) bg-[#e9e5db]">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <CategoryIcon category={item.category} size={40} />
          </div>
        )}
      </div>

      <span
        className={`absolute -top-3 -right-2.5 rotate-6 border-3 border-(--mag-ink) ${
          tag.exact
            ? 'font-anton bg-(--mag-yellow) px-2 py-1 text-xl leading-none'
            : 'bg-white px-1.5 py-1 text-[11px] font-extrabold uppercase'
        }`}
      >
        {tag.label}
      </span>

      {item.isReleased ? (
        <span className="absolute top-2 left-2 -rotate-3 border-2 border-(--mag-ink) bg-(--mag-green) px-2 py-0.5 text-xs font-extrabold text-white uppercase">
          {ui.mag.released}
        </span>
      ) : (item.hypes ?? 0) >= HYPE_STICKER_THRESHOLD ? (
        <span className="font-marker absolute top-2 left-2 -rotate-3 border-2 border-(--mag-ink) bg-(--mag-pink) px-2 text-sm text-white">
          {ui.mag.hype}
        </span>
      ) : null}

      <div className="p-2.5">
        <h4 className="line-clamp-3 text-[15px] leading-tight font-extrabold uppercase">
          {item.title}
        </h4>
        {item.gameTypeLabel && (
          <span className="mt-1 inline-block bg-(--mag-ink) px-1.5 text-[10px] font-bold text-(--mag-yellow) uppercase">
            {item.gameTypeLabel}
          </span>
        )}
        {subtitle && <p className="mt-1 line-clamp-1 text-xs text-(--mag-muted)">{subtitle}</p>}
      </div>
    </button>
  )
}

export function ReleaseCardSkeleton() {
  return (
    <div className="mag-card" aria-hidden>
      <div className="mag-skeleton aspect-3/4 w-full border-b-3 border-(--mag-ink)" />
      <div className="space-y-2 p-2.5">
        <div className="mag-skeleton h-4 w-4/5" />
        <div className="mag-skeleton h-3 w-1/2" />
      </div>
    </div>
  )
}

export function ReleaseGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="mag-grid grid grid-cols-2 gap-4 sm:grid-cols-[repeat(auto-fill,minmax(170px,1fr))] sm:gap-[22px]">
      {children}
    </div>
  )
}
