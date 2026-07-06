import { Tabs } from '@heroui/react'
import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from '../i18n'
import { applyTheme, getStoredTheme, type AppThemeId } from '../lib/theme'

export function ThemeSwitch() {
  const { ui } = useTranslation()
  const [theme, setTheme] = useState<AppThemeId>(getStoredTheme)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  return (
    <Tabs
      selectedKey={theme}
      onSelectionChange={(key) => setTheme(key as AppThemeId)}
      className="w-fit"
    >
      <Tabs.ListContainer>
        <Tabs.List aria-label={ui.a11y.themeSwitch}>
          <Tabs.Tab id="violet" aria-label={ui.theme.light} className="min-w-10 justify-center">
            <Sun className="size-4" aria-hidden />
            <Tabs.Indicator />
          </Tabs.Tab>
          <Tabs.Tab id="dark" aria-label={ui.theme.dark} className="min-w-10 justify-center">
            <Moon className="size-4" aria-hidden />
            <Tabs.Indicator />
          </Tabs.Tab>
        </Tabs.List>
      </Tabs.ListContainer>
    </Tabs>
  )
}
