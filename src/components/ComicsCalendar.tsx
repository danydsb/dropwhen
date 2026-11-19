import { useMemo, useState } from 'react'
import { getIntlLocale, useTranslation } from '../i18n'
import type { ReleaseItem } from '../types'
import { SectionHeading } from './GamesCalendar'
import { ReleaseCard, ReleaseCardSkeleton, ReleaseGrid } from './ReleaseCard'

type KindFilter = 'all' | 'manga' | 'bd'

function FilterButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`border-2 border-(--mag-ink) px-2.5 py-1 text-xs font-extrabold uppercase ${
        selected ? 'bg-(--mag-ink) text-(--mag-yellow)' : 'bg-white'
      }`}
    >
      {children}
    </button>
  )
}

export function ComicsCalendar({
  items,
  loading,
  onOpen,
}: {
  items: ReleaseItem[]
  loading: boolean
  onOpen: (item: ReleaseItem) => void
}) {
  const { ui, locale } = useTranslation()
  const [kind, setKind] = useState<KindFilter>('all')
  const [specialOnly, setSpecialOnly] = useState(false)

  const months = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(getIntlLocale(locale), {
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    })
    const groups = new Map<string, ReleaseItem[]>()
    for (const item of items) {
      if (kind !== 'all' && item.bookKind !== kind) continue
      if (specialOnly && !item.specialEdition) continue
      const key = item.releaseDate?.slice(0, 7)
      if (!key) continue
      groups.set(key, [...(groups.get(key) ?? []), item])
    }
    return [...groups.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, monthItems]) => {
        const label = formatter.format(new Date(`${key}-01T00:00:00Z`))
        return { key, label: label.charAt(0).toUpperCase() + label.slice(1), items: monthItems }
      })
  }, [items, kind, specialOnly, locale])

  if (loading) {
    return (
      <div aria-busy>
        <div className="mag-skeleton mt-14 mb-5 h-11 w-64" />
        <ReleaseGrid>
          {Array.from({ length: 6 }).map((_, index) => (
            <ReleaseCardSkeleton key={index} />
          ))}
        </ReleaseGrid>
      </div>
    )
  }

  return (
    <section>
      <p className="mt-6 max-w-[70ch] text-sm text-(--mag-muted)">{ui.comicsCalendar.intro}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <FilterButton selected={kind === 'all'} onClick={() => setKind('all')}>
          {ui.comicsCalendar.all}
        </FilterButton>
        <FilterButton selected={kind === 'manga'} onClick={() => setKind('manga')}>
          {ui.comicsCalendar.manga}
        </FilterButton>
        <FilterButton selected={kind === 'bd'} onClick={() => setKind('bd')}>
          {ui.comicsCalendar.bd}
        </FilterButton>
        <span className="mx-1 w-0.5 self-stretch bg-(--mag-ink)" aria-hidden />
        <FilterButton selected={specialOnly} onClick={() => setSpecialOnly((value) => !value)}>
          ★ {ui.comicsCalendar.specialOnly}
        </FilterButton>
      </div>

      {months.length === 0 ? (
        <>
          <SectionHeading title={ui.comicsCalendar.title} />
          <p className="border-3 border-dashed border-(--mag-ink) bg-white/60 px-4 py-5 text-center font-semibold">
            {ui.comicsCalendar.empty}
          </p>
        </>
      ) : (
        months.map((month) => (
          <div key={month.key}>
            <SectionHeading title={month.label} count={ui.comicsCalendar.count(month.items.length)} />
            <ReleaseGrid>
              {month.items.map((item) => (
                <ReleaseCard key={item.id} item={item} onOpen={onOpen} />
              ))}
            </ReleaseGrid>
          </div>
        ))
      )}
    </section>
  )
}
