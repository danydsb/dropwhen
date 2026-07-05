import { getUi } from '../i18n'
import { useCallback, useRef, useState } from 'react'
import { isDemoMode } from '../config'
import type { Category, ReleaseItem } from '../types'
import { searchByCategory } from '../services/search'

interface SearchState {
  items: ReleaseItem[]
  warning?: string
  loading: boolean
  error?: string
  hasSearched: boolean
}

export interface SearchParams {
  category: Category
  query: string
}

const initialState: SearchState = {
  items: [],
  loading: false,
  hasSearched: false,
}

export function useSearch() {
  const [state, setState] = useState<SearchState>(initialState)
  const requestIdRef = useRef(0)
  const lastParamsRef = useRef<SearchParams | null>(null)

  const search = useCallback(async (category: Category, query: string) => {
    const trimmed = query.trim()
    if (!trimmed && !isDemoMode()) {
      setState({ ...initialState })
      lastParamsRef.current = null
      return
    }

    const requestId = ++requestIdRef.current
    lastParamsRef.current = { category, query: trimmed }

    setState((prev) => ({ ...prev, loading: true, error: undefined }))

    try {
      const result = await searchByCategory(category, trimmed)
      if (requestId !== requestIdRef.current) return

      setState({
        items: result.items,
        warning: result.warning,
        loading: false,
        hasSearched: true,
      })
    } catch {
      if (requestId !== requestIdRef.current) return

      setState({
        items: [],
        loading: false,
        hasSearched: true,
        error: getUi().errors.searchFailed,
      })
    }
  }, [])

  const clear = useCallback(() => {
    requestIdRef.current += 1
    lastParamsRef.current = null
    setState(initialState)
  }, [])

  const getLastParams = useCallback(() => lastParamsRef.current, [])

  return { ...state, search, clear, getLastParams }
}
