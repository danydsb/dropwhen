import { BookMarked, Gamepad2 } from 'lucide-react'
import type { Category } from '../types'

export const CATEGORY_ICONS = {
  games: Gamepad2,
  comics: BookMarked,
} as const

const ICON_COLORS: Record<Category, string> = {
  games: 'text-games-light',
  comics: 'text-comics-light',
}

export function CategoryIcon({
  category,
  size = 20,
}: {
  category: Category
  size?: number
}) {
  const Icon = CATEGORY_ICONS[category]
  return <Icon size={size} className={ICON_COLORS[category]} aria-hidden />
}
