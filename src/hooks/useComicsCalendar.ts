import { useCallback, useEffect, useState } from 'react'
import { getUi } from '../i18n'
import { fetchUpcomingComics, getUpcomingComicsWarning } from '../services/comics-upcoming'
import type { ReleaseItem } from '../types'

interface ComicsCalendarState {
  items: ReleaseItem[]
  loading: boolean
  warning?: string
  error?: string
}

export function useComicsCalendar(enabled: boolean) {
  const [state, setState] = useState<ComicsCalendarState>({ items: [], loading: false })

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: prev.items.length === 0, error: undefined }))
    try {
      const { items, errors } = await fetchUpcomingComics()
      setState({ items, loading: false, warning: getUpcomingComicsWarning(errors) })
    } catch {
      setState((prev) => ({ ...prev, loading: false, error: getUi().errors.searchFailed }))
    }
  }, [])

  useEffect(() => {
    if (enabled) void load()
  }, [enabled, load])

  return { ...state, reload: load }
}
