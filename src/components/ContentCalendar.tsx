import { useMemo, useState } from 'react'
import { useTranslation } from '../i18n'
import { TRACKED_GAMES } from '../data/tracked-games'
import type { ReleaseItem } from '../types'
import { buildUpcomingMonths, UPCOMING_MONTH_COUNT } from '../utils/calendar-months'
import { daysUntil } from '../utils/dates'
import { SectionHeading } from './GamesCalendar'
import { ReleaseCard, ReleaseCardSkeleton, ReleaseGrid } from './ReleaseCard'

const RECENT_DAYS = 45

function byDate(a: ReleaseItem, b: ReleaseItem): number {
  return (a.releaseDate ?? '9999').localeCompare(b.releaseDate ?? '9999')
}

function EmptyLine({ text }: { text: string }) {
  return (
    <p className="border-3 border-dashed border-(--mag-ink) bg-white/60 px-4 py-5 text-center font-semibold">
      {text}
    </p>
  )
}

export function ContentCalendar({
  items,
  loading,
  onOpen,
}: {
  items: ReleaseItem[]
  loading: boolean
  onOpen: (item: ReleaseItem) => void
}) {
  const { ui, locale } = useTranslation()
  const [gameFilter, setGameFilter] = useState<string | null>(null)

  const groups = useMemo(() => {
    const visible = gameFilter
      ? items.filter((item) => item.parentTitle === gameFilter)
      : items
    const months = buildUpcomingMonths()
    const lastMonthKey = months[months.length - 1]?.key ?? ''

    const now: ReleaseItem[] = []
    const later: ReleaseItem[] = []
    const byMonth = new Map(months.map((month) => [month.key, [] as ReleaseItem[]]))

    for (const item of visible) {
      const days = daysUntil(item.releaseDate)
      if (item.ongoing || (days !== undefined && days <= 0 && days >= -RECENT_DAYS)) {
        now.push(item)
      } else if (days !== undefined && days > 0) {
        const key = item.releaseDate!.slice(0, 7)
        // Vague dates (year / quarter) and far-off ones go to "Later".
        if ((item.dateCertainty === 'confirmed' || item.approximateDay) && key <= lastMonthKey && byMonth.has(key)) {
          byMonth.get(key)!.push(item)
        } else {
          later.push(item)
        }
      }
    }

    return {
      now: now.sort((a, b) => byDate(b, a)),
      months: months.map((month) => ({ month, items: (byMonth.get(month.key) ?? []).sort(byDate) })),
      later: later.sort(byDate),
    }
    // `locale` is a dependency because month labels are localized.
  }, [items, gameFilter, locale])

  if (loading) {
    return (
      <div aria-busy>
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

  const filters = [null, ...TRACKED_GAMES.map((game) => game.name)]

  return (
    <section>
      <p className="mt-6 max-w-[70ch] text-sm text-(--mag-muted)">{ui.content.intro}</p>

      <div role="group" aria-label={ui.content.filterLabel} className="mt-4 flex flex-wrap gap-2">
        {filters.map((name) => {
          const selected = gameFilter === name
          return (
            <button
              key={name ?? 'all'}
              type="button"
              aria-pressed={selected}
              onClick={() => setGameFilter(name)}
              className={`border-2 border-(--mag-ink) px-2.5 py-1 text-xs font-extrabold uppercase ${
                selected ? 'bg-(--mag-ink) text-(--mag-yellow)' : 'bg-white'
              }`}
            >
              {name ?? ui.content.allGames}
            </button>
          )
        })}
      </div>

      <SectionHeading title={ui.content.nowTitle} count={ui.content.count(groups.now.length)} />
      {groups.now.length === 0 ? (
        <EmptyLine text={ui.content.emptyNow} />
      ) : (
        <ReleaseGrid>
          {groups.now.map((item) => (
            <ReleaseCard key={item.id} item={item} onOpen={onOpen} />
          ))}
        </ReleaseGrid>
      )}

      {/* Empty months are hidden: seasons are announced late, a wall of empty boxes says nothing. */}
      {groups.months
        .filter(({ items: monthItems }) => monthItems.length > 0)
        .map(({ month, items: monthItems }) => (
          <div key={month.key}>
            <SectionHeading title={month.label} count={ui.content.count(monthItems.length)} />
            <ReleaseGrid>
              {monthItems.map((item) => (
                <ReleaseCard key={item.id} item={item} onOpen={onOpen} />
              ))}
            </ReleaseGrid>
          </div>
        ))}
      {groups.months.every(({ items: monthItems }) => monthItems.length === 0) && (
        <>
          <SectionHeading title={ui.gamesCalendar.upcomingLabel} />
          <EmptyLine text={ui.content.emptyMonth} />
        </>
      )}

      {groups.later.length > 0 && (
        <>
          <SectionHeading title={ui.content.laterTitle} count={ui.content.count(groups.later.length)} />
          <ReleaseGrid>
            {groups.later.map((item) => (
              <ReleaseCard key={item.id} item={item} onOpen={onOpen} />
            ))}
          </ReleaseGrid>
        </>
      )}
    </section>
  )
}
