import { ui } from '../i18n'
import { Loader2, Search } from 'lucide-react'

export function SearchBar({
  query,
  loading,
  onQueryChange,
  onSubmit,
}: {
  query: string
  loading: boolean
  onQueryChange: (value: string) => void
  onSubmit: () => void
}) {
  return (
    <form
      className="relative"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
    >
      <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" aria-hidden />
      <input
        type="search"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder={ui.search.placeholder}
        className="w-full rounded-2xl border border-slate-700/80 bg-slate-900/80 py-4 pl-12 pr-28 text-base text-white placeholder:text-slate-500 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-600/50"
        autoComplete="off"
      />
      <button
        type="submit"
        disabled={loading}
        className="absolute inset-y-2 right-2 inline-flex items-center gap-1.5 rounded-xl bg-white px-4 text-sm font-semibold text-slate-900 disabled:opacity-40"
      >
        {loading ? <Loader2 size={14} className="animate-spin" aria-hidden /> : ui.search.submit}
      </button>
    </form>
  )
}
