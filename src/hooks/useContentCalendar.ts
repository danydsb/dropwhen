import { useCallback, useEffect, useState } from 'react'
import { getUi } from '../i18n'
import { fetchTrackedContent } from '../services/content'
import type { ReleaseItem } from '../types'

interface ContentCalendarState {
  items: ReleaseItem[]
  loading: boolean
  warning?: string
  error?: string
}

export function useContentCalendar(enabled: boolean) {
  const [state, setState] = useState<ContentCalendarState>({ items: [], loading: false })

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: prev.items.length === 0, error: undefined }))
    try {
      const { items, failedSources } = await fetchTrackedContent()
      setState({
        items,
        loading: false,
        warning:
          failedSources.length > 0
            ? getUi().content.partialWarning(failedSources.join(', '))
            : undefined,
      })
    } catch {
      setState((prev) => ({ ...prev, loading: false, error: getUi().errors.searchFailed }))
    }
  }, [])

  useEffect(() => {
    if (enabled) void load()
  }, [enabled, load])

  return { ...state, reload: load }
}
