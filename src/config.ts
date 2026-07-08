import type { Category } from './types'

export const MIN_SEARCH_QUERY_LENGTH = 4
export const MIN_GAMES_SEARCH_QUERY_LENGTH = 3

export function getMinSearchQueryLength(category: Category): number {
  return category === 'games' ? MIN_GAMES_SEARCH_QUERY_LENGTH : MIN_SEARCH_QUERY_LENGTH
}

export function isDemoMode(): boolean {
  const flag = import.meta.env.VITE_DEMO_MODE?.trim().toLowerCase()
  if (flag === 'true') return true
  if (flag === 'false') return false
  return false
}
