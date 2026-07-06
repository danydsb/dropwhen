export type AppThemeId = 'violet' | 'dark'

export const THEME_STORAGE_KEY = 'dropwhen-theme'

const THEME_META_COLORS: Record<AppThemeId, string> = {
  violet: '#faf8ff',
  dark: '#1a1825',
}

export function getStoredTheme(): AppThemeId {
  const stored = localStorage.getItem(THEME_STORAGE_KEY)
  return stored === 'dark' ? 'dark' : 'violet'
}

export function applyTheme(themeId: AppThemeId) {
  const appearance = themeId === 'dark' ? 'dark' : 'light'

  document.documentElement.classList.remove('light', 'dark')
  document.documentElement.classList.add(appearance)
  document.documentElement.dataset.theme = themeId

  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
  if (meta) meta.content = THEME_META_COLORS[themeId]

  localStorage.setItem(THEME_STORAGE_KEY, themeId)
}
