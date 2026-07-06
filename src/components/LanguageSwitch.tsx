import { Tabs } from '@heroui/react'
import { useTranslation, type Locale } from '../i18n'

export function LanguageSwitch() {
  const { locale, setLocale, ui } = useTranslation()

  return (
    <Tabs
      selectedKey={locale}
      onSelectionChange={(key) => setLocale(key as Locale)}
      className="w-fit"
    >
      <Tabs.ListContainer>
        <Tabs.List aria-label={ui.a11y.languageSwitch}>
          <Tabs.Tab id="fr" className="min-w-10 uppercase">
            {ui.language.fr}
            <Tabs.Indicator />
          </Tabs.Tab>
          <Tabs.Tab id="en" className="min-w-10 uppercase">
            {ui.language.en}
            <Tabs.Indicator />
          </Tabs.Tab>
        </Tabs.List>
      </Tabs.ListContainer>
    </Tabs>
  )
}
