import { useCallback } from 'react'
import type { ReleaseItem } from '../types'
import { openGoogleCalendar } from '../services/google-calendar'

export function useGoogleCalendar() {
  const addEvent = useCallback((item: ReleaseItem) => {
    openGoogleCalendar(item)
  }, [])

  return { addEvent }
}
