import { useTranslation } from '../i18n'
import type { ReleaseItem } from '../types'
import { ReleaseCard, ReleaseCardSkeleton, ReleaseGrid } from './ReleaseCard'

function EmptyBox({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="mag-box mt-6 bg-white px-6 py-14 text-center">
      <h2 className="font-anton text-4xl uppercase">{title}</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-[var(--mag-muted)]">{hint}</p>
    </div>
  )
}

export function ResultList({
  items,
  loading,
  hasSearched,
  isDemoMode,
  onOpen,
}: {
  items: ReleaseItem[]
  loading: boolean
  hasSearched: boolean
  isDemoMode: boolean
  onOpen: (item: ReleaseItem) => void
}) {
  const { ui } = useTranslation()

  if (loading) {
    return (
      <div className="mt-6" aria-busy>
        <ReleaseGrid>
          {Array.from({ length: 6 }).map((_, index) => (
            <ReleaseCardSkeleton key={index} />
          ))}
        </ReleaseGrid>
      </div>
    )
  }

  if (hasSearched && items.length === 0) {
    return <EmptyBox title={ui.empty.noResults} hint={ui.search.placeholder} />
  }

  if (!hasSearched) {
    return (
      <EmptyBox title={ui.empty.title} hint={isDemoMode ? ui.empty.hintDemo : ui.empty.hint} />
    )
  }

  return (
    <section>
      <div className="mt-10 mb-5 flex items-center gap-3.5">
        <span className="bg-[var(--mag-ink)] px-2.5 py-1 text-[13px] font-extrabold text-[var(--mag-yellow)]">
          {ui.hero.resultsCount(items.length)}
        </span>
        <hr className="flex-1 border-0 border-t-3 border-[var(--mag-ink)]" />
      </div>
      <ReleaseGrid>
        {items.map((item) => (
          <ReleaseCard key={item.id} item={item} onOpen={onOpen} />
        ))}
      </ReleaseGrid>
    </section>
  )
}
