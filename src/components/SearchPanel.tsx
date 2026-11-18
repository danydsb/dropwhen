import { getMinSearchQueryLength, isDemoMode } from '../config'
import { useTranslation } from '../i18n'
import type { Category } from '../types'
import { CATEGORY_ICONS } from './CategoryIcon'

const CATEGORIES: Category[] = ['games', 'comics']

export function SearchPanel({
  category,
  query,
  onCategoryChange,
  onQueryChange,
}: {
  category: Category
  query: string
  onCategoryChange: (category: Category) => void
  onQueryChange: (value: string) => void
}) {
  const { ui } = useTranslation()
  const trimmedQuery = query.trim()
  const minLength = getMinSearchQueryLength(category)
  const isTooShort = !isDemoMode() && trimmedQuery.length > 0 && trimmedQuery.length < minLength

  return (
    <div className="mt-6">
      <form
        onSubmit={(event) => event.preventDefault()}
        className="flex flex-wrap gap-2.5"
      >
        <div role="tablist" aria-label={ui.a11y.categorySwitch} className="flex gap-2.5">
          {CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICONS[cat]
            const selected = cat === category
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => onCategoryChange(cat)}
                className={`mag-press inline-flex items-center gap-2 px-3.5 py-2 text-[13px] font-extrabold uppercase ${
                  selected ? 'bg-(--mag-ink) text-(--mag-yellow)' : 'bg-white'
                }`}
              >
                <Icon size={15} strokeWidth={2.5} aria-hidden />
                {ui.categories[cat]}
              </button>
            )
          })}
        </div>
        <input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={ui.search.placeholder}
          autoComplete="off"
          aria-label={ui.search.placeholder}
          className="min-w-[220px] flex-1 border-3 border-(--mag-ink) bg-white px-3 py-2 text-[15px] font-semibold shadow-[3px_3px_0_var(--mag-ink)] outline-none focus:shadow-[3px_3px_0_var(--mag-blue)]"
        />
      </form>
      {isTooShort && (
        <p className="mt-2 text-xs font-semibold text-(--mag-muted)">
          {ui.search.minLengthHint(minLength)}
        </p>
      )}
    </div>
  )
}
