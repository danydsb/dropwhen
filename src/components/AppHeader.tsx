import { CalendarDays, FlaskConical } from 'lucide-react'
import { useTranslation } from '../i18n'
import { LanguageSwitch } from './LanguageSwitch'

export function AppHeader({ demoMode }: { demoMode: boolean }) {
  const { ui } = useTranslation()

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-linear-to-br from-violet-600 to-fuchsia-600 shadow-lg shadow-violet-900/40">
            <CalendarDays className="h-4 w-4 text-white" aria-hidden />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-500">
              {ui.header.tagline}
            </p>
            <p className="text-sm font-bold text-white">DropWhen</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitch />
          {demoMode && (
            <span className="hidden items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 text-[11px] font-medium text-sky-200 sm:inline-flex">
              <FlaskConical size={12} aria-hidden />
              {ui.header.demoBadge}
            </span>
          )}
        </div>
      </div>
    </header>
  )
}
