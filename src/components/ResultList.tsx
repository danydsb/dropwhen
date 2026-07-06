import { useTranslation } from '../i18n'
import { Card } from '@heroui/react'
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
          <Card key={i}>
            <Card.Content className="flex animate-pulse gap-4 p-5">
              <div className="bg-default size-16 shrink-0 rounded-xl sm:size-[72px]" />
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

  if (hasSearched && items.length === 0) {
    return (
      <Card className="border-dashed text-center">
        <Card.Content className="px-6 py-14">
          <SearchX className="text-muted mx-auto mb-3 size-10" aria-hidden />
          <h2 className="text-lg font-semibold">{ui.empty.noResults}</h2>
          <p className="text-muted mt-1 text-sm">{ui.search.placeholder}</p>
        </Card.Content>
      </Card>
    )
  }

  if (!hasSearched) {
    return (
      <Card className="text-center">
        <Card.Content className="px-6 py-16">
          <div className="bg-accent/15 mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl">
            <CalendarSearch className="text-accent size-7" aria-hidden />
          </div>
          <h2 className="text-lg font-semibold">{ui.empty.title}</h2>
          <p className="text-muted mx-auto mt-2 max-w-sm text-sm leading-relaxed">
            {isDemoMode ? ui.empty.hintDemo : ui.empty.hint}
          </p>
        </Card.Content>
      </Card>
    )
  }

  return (
    <section className="space-y-4">
      <div className="text-muted flex items-center gap-2 text-sm">
        <Sparkles size={14} className="text-accent" aria-hidden />
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
