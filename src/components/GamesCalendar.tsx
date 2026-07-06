import { useTranslation } from '../i18n'
import { Card } from '@heroui/react'
import { CalendarDays } from 'lucide-react'
import { UPCOMING_MONTH_COUNT } from '../utils/calendar-months'
import type { ReleaseItem } from '../types'
import { ResultCard } from './ResultCard'

function MonthSkeleton() {
  return (
    <div className="space-y-3">
      <div className="bg-default h-6 w-40 animate-pulse rounded-lg" />
      {Array.from({ length: 2 }).map((_, index) => (
        <Card key={index}>
          <Card.Content className="flex animate-pulse gap-4 p-5">
            <div className="bg-default size-16 shrink-0 rounded-xl" />
            <div className="flex-1 space-y-2">
              <div className="bg-default h-4 w-2/3 rounded" />
              <div className="bg-default h-3 w-1/3 rounded" />
              <div className="bg-default h-9 w-36 rounded-xl" />
            </div>
          </Card.Content>
        </Card>
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

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="space-y-1">
          <div className="bg-default h-6 w-48 animate-pulse rounded-lg" />
          <div className="bg-default h-4 w-64 animate-pulse rounded" />
        </div>
        {Array.from({ length: UPCOMING_MONTH_COUNT }).map((_, index) => (
          <MonthSkeleton key={index} />
        ))}
      </div>
    )
  }

  return (
    <section className="space-y-8">
      <header className="space-y-1">
        <div className="flex items-center gap-2">
          <CalendarDays size={18} className="text-accent" aria-hidden />
          <h2 className="text-lg font-semibold">{ui.gamesCalendar.title}</h2>
        </div>
        <p className="text-muted text-sm">{ui.gamesCalendar.subtitle}</p>
      </header>

      {sections.map(({ month, items }) => (
        <div key={month.key} className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="bg-accent size-2 shrink-0 rounded-full" aria-hidden />
            <h3 className="text-base font-semibold capitalize">{month.label}</h3>
            <span className="text-muted text-xs">{ui.gamesCalendar.count(items.length)}</span>
          </div>

          {items.length === 0 ? (
            <Card className="border-dashed text-center">
              <Card.Content className="px-4 py-6">
                <p className="text-muted text-sm">{ui.gamesCalendar.emptyMonth}</p>
              </Card.Content>
            </Card>
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
