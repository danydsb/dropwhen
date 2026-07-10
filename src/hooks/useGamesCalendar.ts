import { getUi } from '../i18n'
import { useCallback, useEffect, useState } from 'react'
import { fetchUpcomingGames } from '../services/igdb'
import type { ReleaseItem } from '../types'
import {
  buildUpcomingMonths,
  groupReleaseItemsByMonth,
  type MonthSection,
} from '../utils/calendar-months'

interface GamesCalendarState {
  todayItems: ReleaseItem[]
  sections: Array<{ month: MonthSection; items: ReleaseItem[] }>
  loading: boolean
  warning?: string
  error?: string
}

const emptyState: GamesCalendarState = {
  todayItems: [],
  sections: [],
  loading: false,
}

export function useGamesCalendar(enabled: boolean) {
  const [state, setState] = useState<GamesCalendarState>(emptyState)

  const load = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      loading: prev.sections.length === 0,
      error: undefined,
    }))

    try {
      const result = await fetchUpcomingGames()
      const months = buildUpcomingMonths()
      const { todayItems, sections } = groupReleaseItemsByMonth(result.items, months)

      setState({
        todayItems,
        sections,
        loading: false,
        warning: result.warning,
      })
    } catch {
      setState((prev) => ({
        sections: prev.sections.length > 0
          ? prev.sections
          : buildUpcomingMonths().map((month) => ({ month, items: [] })),
        todayItems: prev.todayItems,
        loading: false,
        error: getUi().errors.searchFailed,
      }))
    }
  }, [])

  useEffect(() => {
    if (!enabled) {
      setState(emptyState)
      return
    }

    void load()
  }, [enabled, load])

  return { ...state, reload: load }
}
