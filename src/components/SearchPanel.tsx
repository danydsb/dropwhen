import { getMinSearchQueryLength, isDemoMode } from '../config'
import { useTranslation } from '../i18n'
import { Card, Input } from '@heroui/react'
import type { Category } from '../types'
import { CategoryTabs } from './CategoryTabs'

export function SearchPanel({
  category,
  query,
  onCategoryChange,
  onQueryChange,
}: {
  category: Category
  query: string
  onCategoryChange: (category: Category) => void
  onQueryChange: (value: string) => void
}) {
  const { ui } = useTranslation()
  const categories: Category[] = ['games', 'comics']
  const trimmedQuery = query.trim()
  const minLength = getMinSearchQueryLength(category)
  const isTooShort =
    !isDemoMode() && trimmedQuery.length > 0 && trimmedQuery.length < minLength

  return (
    <Card>
      <Card.Content className="flex flex-col gap-4 p-4 sm:p-5">
        <CategoryTabs
          category={category}
          categories={categories}
          labels={ui.categories}
          ariaLabel={ui.a11y.categorySwitch}
          onCategoryChange={onCategoryChange}
        />

        <form
          onSubmit={(e) => {
            e.preventDefault()
          }}
          className="flex flex-col gap-2"
        >
          <Input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={ui.search.placeholder}
            autoComplete="off"
            fullWidth
            className="min-w-0 flex-1"
            aria-label={ui.search.placeholder}
          />
        </form>

        {isTooShort ? <p className="text-center text-xs text-muted">{ui.search.minLengthHint(minLength)}</p> : null}
      </Card.Content>
    </Card>
  )
}
