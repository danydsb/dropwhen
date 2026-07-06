import { MIN_SEARCH_QUERY_LENGTH, isDemoMode } from '../config'
import { getUi } from '../i18n'
import type { Category, SearchResult } from '../types'
import { searchDemo } from '../data/demo-results'
import { searchComics } from './releases'
import { searchGames } from './rawg'

export async function searchByCategory(
  category: Category,
  query: string,
): Promise<SearchResult> {
  if (isDemoMode()) {
    await new Promise((r) => setTimeout(r, 400))
    return searchDemo(category, query.trim())
  }

  const trimmed = query.trim()
  if (!trimmed) return { items: [] }
  if (trimmed.length < MIN_SEARCH_QUERY_LENGTH) {
    return { items: [], warning: getUi().warnings.queryTooShort(MIN_SEARCH_QUERY_LENGTH) }
  }

  switch (category) {
    case 'games':
      return searchGames(trimmed)
    case 'comics':
      return searchComics(trimmed)
  }
}
