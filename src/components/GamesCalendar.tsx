import { useTranslation } from '../i18n'
import type { ReleaseItem } from '../types'
import { UPCOMING_MONTH_COUNT } from '../utils/calendar-months'
import { daysUntil, formatDisplayDate, getTodayIso } from '../utils/dates'
import { ReleaseCard, ReleaseCardSkeleton, ReleaseGrid } from './ReleaseCard'

function SectionHeading({ title, count }: { title: string; count?: string }) {
  return (
    <div className="mt-14 mb-5 flex items-center gap-3.5">
      <h3 className="font-anton text-[34px] leading-none uppercase sm:text-[46px]">{title}</h3>
      {count && (
        <span className="bg-[var(--mag-ink)] px-2.5 py-1 text-[13px] font-extrabold whitespace-nowrap text-[var(--mag-yellow)]">
          {count}
        </span>
      )}
      <hr className="flex-1 border-0 border-t-3 border-[var(--mag-ink)]" />
    </div>
  )
}

function pickHeadliner(items: ReleaseItem[]): ReleaseItem | undefined {
  return items
    .filter((item) => item.dateCertainty === 'confirmed' && (daysUntil(item.releaseDate) ?? -1) >= 0)
    .sort((a, b) => (b.hypes ?? 0) - (a.hypes ?? 0))[0]
}

function Headliner({
  item,
  onOpen,
  onAddToCalendar,
}: {
  item: ReleaseItem
  onOpen: (item: ReleaseItem) => void
  onAddToCalendar: (item: ReleaseItem) => void
}) {
  const { ui } = useTranslation()
  const days = daysUntil(item.releaseDate) ?? 0
  const background = item.artworkUrl ?? item.images?.[0] ?? item.imageUrl

  return (
    <div className="relative mt-6 grid overflow-hidden border-3 border-[var(--mag-ink)] bg-[var(--mag-blue)] text-white shadow-[8px_8px_0_var(--mag-ink)] md:grid-cols-2">
      <button
        type="button"
        onClick={() => onOpen(item)}
        aria-label={ui.mag.openDetails(item.title)}
        className="min-h-[220px] cursor-pointer border-b-3 border-[var(--mag-ink)] bg-cover bg-center md:min-h-[340px] md:border-r-3 md:border-b-0"
        style={{ backgroundImage: background ? `url(${background})` : undefined }}
      />
      <div className="font-anton absolute top-4 left-4 grid size-24 -rotate-12 place-items-center rounded-full border-3 border-[var(--mag-ink)] bg-[var(--mag-pink)] text-center text-3xl leading-[0.9] text-white">
        <div>
          {ui.mag.countdown(days)}
          <small className="block font-sans text-[10px] font-extrabold uppercase">
            {ui.mag.countdownUnit(days)}
          </small>
        </div>
      </div>
      <div className="p-6 sm:p-7">
        <span className="inline-block border-2 border-[var(--mag-ink)] bg-[var(--mag-yellow)] px-2 py-0.5 text-xs font-extrabold text-[var(--mag-ink)] uppercase">
          {ui.mag.mostAnticipated}
        </span>
        <h2 className="font-anton my-3.5 text-[44px] leading-[0.9] uppercase sm:text-[64px] lg:text-[78px]">
          {item.title}
        </h2>
        <span className="font-marker inline-block -rotate-3 text-2xl text-[var(--mag-yellow)]">
          {item.releaseDateLabel} !
        </span>
        <p className="mt-3.5 max-w-[40ch] opacity-90">
          {[item.developer, item.platformOrPublisher].filter(Boolean).join(' · ')}
          {item.hypes ? (
            <>
              <br />
              {ui.mag.followers(item.hypes)}
            </>
          ) : null}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => onAddToCalendar(item)}
            className="mag-press bg-[var(--mag-yellow)] px-4 py-2.5 text-sm font-extrabold text-[var(--mag-ink)] uppercase"
          >
            {ui.mag.addToCalendar} →
          </button>
          <button
            type="button"
            onClick={() => onOpen(item)}
            className="mag-press bg-white px-4 py-2.5 text-sm font-extrabold text-[var(--mag-ink)] uppercase"
          >
            {ui.card.viewSource}
          </button>
        </div>
      </div>
    </div>
  )
}

export function GamesCalendar({
  todayItems,
  sections,
  loading,
  onOpen,
  onAddToCalendar,
}: {
  todayItems: ReleaseItem[]
  sections: Array<{ month: { key: string; label: string }; items: ReleaseItem[] }>
  loading: boolean
  onOpen: (item: ReleaseItem) => void
  onAddToCalendar: (item: ReleaseItem) => void
}) {
  const { ui } = useTranslation()

  if (loading) {
    return (
      <div aria-busy>
        <div className="mag-skeleton mt-6 h-[340px] border-3 border-[var(--mag-ink)]" />
        {Array.from({ length: Math.min(UPCOMING_MONTH_COUNT, 2) }).map((_, sectionIndex) => (
          <div key={sectionIndex}>
            <div className="mag-skeleton mt-14 mb-5 h-11 w-64" />
            <ReleaseGrid>
              {Array.from({ length: 6 }).map((_, index) => (
                <ReleaseCardSkeleton key={index} />
              ))}
            </ReleaseGrid>
          </div>
        ))}
      </div>
    )
  }

  const upcoming = sections.flatMap((section) => section.items)
  const headliner = pickHeadliner(upcoming)

  return (
    <section>
      {headliner && (
        <Headliner item={headliner} onOpen={onOpen} onAddToCalendar={onAddToCalendar} />
      )}

      <SectionHeading
        title={ui.gamesCalendar.todayTitle}
        count={formatDisplayDate(getTodayIso())}
      />
      {todayItems.length === 0 ? (
        <p className="border-3 border-dashed border-[var(--mag-ink)] bg-white/60 px-4 py-5 text-center font-semibold">
          {ui.gamesCalendar.emptyToday}
        </p>
      ) : (
        <ReleaseGrid>
          {todayItems.map((item) => (
            <ReleaseCard key={item.id} item={item} onOpen={onOpen} />
          ))}
        </ReleaseGrid>
      )}

      {sections.map(({ month, items }) => (
        <div key={month.key}>
          <SectionHeading title={month.label} count={ui.gamesCalendar.count(items.length)} />
          {items.length === 0 ? (
            <p className="border-3 border-dashed border-[var(--mag-ink)] bg-white/60 px-4 py-5 text-center font-semibold">
              {ui.gamesCalendar.emptyMonth}
            </p>
          ) : (
            <ReleaseGrid>
              {items.map((item) => (
                <ReleaseCard key={item.id} item={item} onOpen={onOpen} />
              ))}
            </ReleaseGrid>
          )}
        </div>
      ))}
    </section>
  )
}
