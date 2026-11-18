import { useTranslation, type Locale } from '../i18n'

const LOCALES: Locale[] = ['fr', 'en']

export function LanguageSwitch() {
  const { locale, setLocale, ui } = useTranslation()

  return (
    <div role="group" aria-label={ui.a11y.languageSwitch} className="flex">
      {LOCALES.map((value) => (
        <button
          key={value}
          type="button"
          aria-pressed={locale === value}
          onClick={() => setLocale(value)}
          className={`-ml-[3px] border-3 border-(--mag-ink) px-2.5 py-1 text-xs font-extrabold uppercase first:ml-0 ${
            locale === value ? 'bg-(--mag-ink) text-(--mag-yellow)' : 'bg-white'
          }`}
        >
          {ui.language[value]}
        </button>
      ))}
    </div>
  )
}
