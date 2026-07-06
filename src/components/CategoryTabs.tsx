import { Tabs } from '@heroui/react'
import type { Category } from '../types'
import { CATEGORY_ICONS } from './CategoryIcon'

export function CategoryTabs({
  category,
  categories,
  labels,
  ariaLabel,
  onCategoryChange,
}: {
  category: Category
  categories: Category[]
  labels: Record<Category, string>
  ariaLabel: string
  onCategoryChange: (category: Category) => void
}) {
  return (
    <Tabs
      selectedKey={category}
      onSelectionChange={(key) => onCategoryChange(key as Category)}
      className="w-full"
    >
      <Tabs.ListContainer>
        <Tabs.List aria-label={ariaLabel} className="tabs-equal">
          {categories.map((cat) => {
            const Icon = CATEGORY_ICONS[cat]
            return (
              <Tabs.Tab key={cat} id={cat} className="justify-center">
                <span className="flex items-center justify-center gap-2">
                  <Icon size={15} strokeWidth={2} aria-hidden />
                  <span className="truncate">{labels[cat]}</span>
                </span>
                <Tabs.Indicator />
              </Tabs.Tab>
            )
          })}
        </Tabs.List>
      </Tabs.ListContainer>
    </Tabs>
  )
}
