import { getMinSearchQueryLength, isDemoMode } from '../config'
import { getUi } from '../i18n'
import type { Category, SearchResult } from '../types'
import { searchDemo } from '../data/demo-results'
import { searchComics } from './releases'
import { searchGames } from './igdb'

export async function searchByCategory(
  category: Category,
  query: string,
): Promise<SearchResult> {
  if (isDemoMode()) {
    await new Promise((r) => setTimeout(r, 400))
    return searchDemo(category, query.trim())
  }

  const trimmed = query.trim()
  const minLength = getMinSearchQueryLength(category)
  if (!trimmed) return { items: [] }
  if (trimmed.length < minLength) {
    return { items: [], warning: getUi().warnings.queryTooShort(minLength) }
  }

  switch (category) {
    case 'games':
      return searchGames(trimmed)
    case 'comics':
      return searchComics(trimmed)
  }
}
