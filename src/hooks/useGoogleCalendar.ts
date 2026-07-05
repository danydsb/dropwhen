import { getUi } from '../i18n'
import { useCallback, useState } from 'react'
import type { ReleaseItem } from '../types'
import { buildGoogleCalendarUrl } from '../services/google-calendar'

export function useGoogleCalendar() {
  const [error, setError] = useState<string | null>(null)

  const addEvent = useCallback((item: ReleaseItem) => {
    setError(null)
    const opened = window.open(
      buildGoogleCalendarUrl(item),
      '_blank',
      'noopener,noreferrer',
    )
    if (!opened) {
      setError(getUi().errors.popupBlocked)
    }
  }, [])

  return { addEvent, error, clearError: () => setError(null) }
}
