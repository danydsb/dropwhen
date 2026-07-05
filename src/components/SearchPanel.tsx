import { useTranslation } from '../i18n'
import { Loader2, Search } from 'lucide-react'
import type { Category } from '../types'
import { CATEGORY_GRADIENTS } from '../lib/category-gradients'
import { CATEGORY_ICONS } from './CategoryIcon'
import { ShineBorder } from './ui/shine-border'
import { ShimmerButton } from './ui/shimmer-button'

export function SearchPanel({
  category,
  query,
  loading,
  onCategoryChange,
  onQueryChange,
  onSubmit,
}: {
  category: Category
  query: string
  loading: boolean
  onCategoryChange: (category: Category) => void
  onQueryChange: (value: string) => void
  onSubmit: () => void
}) {
  const { ui } = useTranslation()
  const categories: Category[] = ['games', 'manga', 'comics']
  const activeGradient = CATEGORY_GRADIENTS[category]

  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50 p-1 shadow-2xl shadow-black/40 backdrop-blur-sm sm:rounded-3xl sm:p-1.5">
      <ShineBorder
        shineColor={['#8b5cf6', '#f43f5e', '#f59e0b', '#a78bfa']}
        duration={12}
        borderWidth={1}
      />

      <div className="relative rounded-[inherit] bg-slate-950/90 p-4 sm:p-5">
        <div className="mb-4 flex rounded-xl bg-slate-900 p-1">
          {categories.map((cat) => {
            const Icon = CATEGORY_ICONS[cat]
            const isActive = category === cat
            const gradient = CATEGORY_GRADIENTS[cat]
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onCategoryChange(cat)}
                className={[
                  'flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2.5 text-xs font-semibold transition-all sm:gap-2 sm:text-sm',
                  isActive
                    ? 'text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200',
                ].join(' ')}
                style={
                  isActive
                    ? { background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})` }
                    : undefined
                }
              >
                <Icon size={15} strokeWidth={2} aria-hidden />
                <span className="truncate">{ui.categories[cat]}</span>
              </button>
            )
          })}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit()
          }}
        >
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative min-w-0 flex-1">
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                aria-hidden
              />
              <input
                type="search"
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                placeholder={ui.search.placeholder}
                className="w-full rounded-xl border border-slate-700/80 bg-slate-900 py-3 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                autoComplete="off"
              />
            </div>
            <ShimmerButton
              type="submit"
              disabled={loading}
              shimmerColor={activeGradient.to}
              background={`linear-gradient(135deg, ${activeGradient.from}, ${activeGradient.to})`}
              borderRadius="12px"
              className="shrink-0 gap-2 px-6 py-3 text-sm font-semibold sm:min-w-[120px]"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" aria-hidden />
              ) : (
                <Search size={16} aria-hidden />
              )}
              {ui.search.submit}
            </ShimmerButton>
          </div>
        </form>
      </div>
    </section>
  )
}
