import { getCategoryLabel } from '../i18n'
import type { Category } from '../types'
import { CATEGORY_ICONS } from './CategoryIcon'

export const CATEGORY_STYLES: Record<
  Category,
  { ring: string; badge: string; button: string; glow: string }
> = {
  games: {
    ring: 'ring-games/30',
    badge: 'bg-games/20 text-games-light border-games/30',
    button: 'bg-games hover:bg-games-light',
    glow: 'shadow-games/20',
  },
  manga: {
    ring: 'ring-manga/30',
    badge: 'bg-manga/20 text-manga-light border-manga/30',
    button: 'bg-manga hover:bg-manga-light',
    glow: 'shadow-manga/20',
  },
  comics: {
    ring: 'ring-comics/30',
    badge: 'bg-comics/20 text-comics-light border-comics/30',
    button: 'bg-comics hover:bg-comics-light',
    glow: 'shadow-comics/20',
  },
}

export function CategorySelector({
  value,
  onChange,
}: {
  value: Category
  onChange: (category: Category) => void
}) {
  const categories: Category[] = ['games', 'manga', 'comics']

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {categories.map((category) => {
        const styles = CATEGORY_STYLES[category]
        const Icon = CATEGORY_ICONS[category]
        const isActive = value === category
        return (
          <button
            key={category}
            type="button"
            onClick={() => onChange(category)}
            className={[
              'inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all',
              isActive
                ? `${styles.button} border-transparent text-white shadow-lg ${styles.glow}`
                : 'border-slate-700 bg-slate-900/60 text-slate-300 hover:border-slate-500 hover:text-white',
            ].join(' ')}
          >
            <Icon size={16} strokeWidth={2} aria-hidden />
            {getCategoryLabel(category)}
          </button>
        )
      })}
    </div>
  )
}
