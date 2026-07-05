import type { Category } from '../types'

export const CATEGORY_GRADIENTS: Record<
  Category,
  { from: string; to: string; glow: string }
> = {
  games: { from: '#8b5cf6', to: '#a78bfa', glow: '#4c1d95' },
  comics: { from: '#f59e0b', to: '#fbbf24', glow: '#78350f' },
}
