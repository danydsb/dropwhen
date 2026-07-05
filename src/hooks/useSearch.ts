import { ui } from '../i18n'
import { useCallback, useState } from 'react'
import type { ReleaseItem } from '../types'
import type { Category } from '../types'
import { searchByCategory } from '../services/search'

interface SearchState {
  items: ReleaseItem[]
  warning?: string
  loading: boolean
  error?: string
  hasSearched: boolean
}

const initialState: SearchState = {
  items: [],
  loading: false,
  hasSearched: false,
}

export function useSearch() {
  const [state, setState] = useState<SearchState>(initialState)

  const search = useCallback(async (category: Category, query: string) => {
    setState((prev) => ({ ...prev, loading: true, error: undefined }))
    try {
      const result = await searchByCategory(category, query)
      setState({
        items: result.items,
        warning: result.warning,
        loading: false,
        hasSearched: true,
      })
    } catch {
      setState({
        items: [],
        loading: false,
        hasSearched: true,
        error: ui.errors.searchFailed,
      })
    }
  }, [])

  return { ...state, search }
}
