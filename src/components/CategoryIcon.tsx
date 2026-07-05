import { BookOpen, Gamepad2, Library, type LucideIcon } from 'lucide-react'
import type { Category } from '../types'

const CATEGORY_ICONS: Record<Category, LucideIcon> = {
  games: Gamepad2,
  manga: BookOpen,
  comics: Library,
}

const CATEGORY_ICON_COLORS: Record<Category, string> = {
  games: 'text-games-light',
  manga: 'text-manga-light',
  comics: 'text-comics-light',
}

export function CategoryIcon({
  category,
  size = 48,
  className = '',
}: {
  category: Category
  size?: number
  className?: string
}) {
  const Icon = CATEGORY_ICONS[category]
  return (
    <Icon
      size={size}
      strokeWidth={1.5}
      aria-hidden
      className={`${CATEGORY_ICON_COLORS[category]} ${className}`.trim()}
    />
  )
}

export { CATEGORY_ICONS }
