import { ui } from '../i18n'
import { useCallback, useState } from 'react'
import { isDemoMode } from '../config'
import type { ReleaseItem } from '../types'
import {
  addToGoogleCalendar,
  CalendarError,
  resolveCalendarErrorMessage,
} from '../services/google-calendar'

export function useGoogleCalendar() {
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [successId, setSuccessId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const addEvent = useCallback(async (item: ReleaseItem) => {
    if (isDemoMode()) {
      setError(ui.banners.demoCalendar)
      return
    }

    setLoadingId(item.id)
    setError(null)
    setSuccessId(null)

    try {
      await addToGoogleCalendar(item)
      setSuccessId(item.id)
      window.setTimeout(() => setSuccessId(null), 4000)
    } catch (err) {
      setError(
        err instanceof CalendarError
          ? resolveCalendarErrorMessage(err)
          : ui.errors.unexpected,
      )
    } finally {
      setLoadingId(null)
    }
  }, [])

  return { addEvent, loadingId, successId, error, clearError: () => setError(null) }
}
