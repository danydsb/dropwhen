import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { LocaleProvider } from './i18n'
import { getLocale } from './i18n'
import './index.css'
import App from './App.tsx'
import { ThemePreviewPage } from './components/ThemePreviewPage.tsx'
import { applyTheme, getStoredTheme } from './lib/theme'

document.documentElement.lang = getLocale()

const preview = new URLSearchParams(window.location.search).get('preview')
const isThemePreview = preview === 'themes'

if (!isThemePreview) {
  applyTheme(getStoredTheme())
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LocaleProvider>
      {isThemePreview ? <ThemePreviewPage /> : <App />}
    </LocaleProvider>
  </StrictMode>,
)
