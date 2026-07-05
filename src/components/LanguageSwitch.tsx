import { Languages } from 'lucide-react'
import { useTranslation, type Locale } from '../i18n'

export function LanguageSwitch() {
  const { locale, setLocale, ui } = useTranslation()

  const options: Locale[] = ['fr', 'en']

  return (
    <div
      className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-900/60 p-0.5"
      role="group"
      aria-label={ui.a11y.languageSwitch}
    >
      <Languages size={14} className="ml-2 text-slate-500" aria-hidden />
      {options.map((code) => {
        const active = locale === code
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLocale(code)}
            className={[
              'rounded-full px-2.5 py-1 text-xs font-semibold uppercase transition',
              active
                ? 'bg-white text-slate-900'
                : 'text-slate-400 hover:text-white',
            ].join(' ')}
            aria-pressed={active}
          >
            {ui.language[code]}
          </button>
        )
      })}
    </div>
  )
}
