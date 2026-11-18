import { useTranslation, getIntlLocale } from '../i18n'

export function HeroSection() {
  const { ui, locale } = useTranslation()
  const monthLabel = new Intl.DateTimeFormat(getIntlLocale(locale), {
    month: 'long',
    year: 'numeric',
  }).format(new Date())

  return (
    <header>
      <div className="flex flex-wrap items-center justify-between gap-3">
      <h1 className="font-anton text-[56px] leading-[0.85] uppercase sm:text-[104px]">
        Drop
        <span className="inline-block -rotate-2 border-3 border-[var(--mag-ink)] bg-[var(--mag-yellow)] px-[0.08em]">
          when
        </span>
      </h1>
      <span className="mag-box bg-white px-3 py-2 text-xs font-extrabold uppercase">
        {ui.mag.issue(monthLabel)}
      </span>
      </div>
      <p className="mt-3 max-w-[60ch] text-sm text-[var(--mag-muted)]">{ui.hero.subtitle}</p>
    </header>
  )
}
