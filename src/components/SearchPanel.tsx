import { MIN_SEARCH_QUERY_LENGTH, isDemoMode } from '../config'
import { useTranslation } from '../i18n'
import { Button, Card, Input } from '@heroui/react'
import { Loader2, Search } from 'lucide-react'
import type { Category } from '../types'
import { CategoryTabs } from './CategoryTabs'

export function SearchPanel({
  category,
  query,
  loading,
  onCategoryChange,
  onQueryChange,
  onSubmit,
}: {
  category: Category
  query: string
  loading: boolean
  onCategoryChange: (category: Category) => void
  onQueryChange: (value: string) => void
  onSubmit: () => void
}) {
  const { ui } = useTranslation()
  const categories: Category[] = ['games', 'comics']
  const trimmedQuery = query.trim()
  const isTooShort =
    !isDemoMode() && trimmedQuery.length > 0 && trimmedQuery.length < MIN_SEARCH_QUERY_LENGTH

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
            onSubmit()
          }}
          className="flex flex-col gap-2 sm:flex-row"
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
          <Button
            type="submit"
            isDisabled={loading || isTooShort}
            className="shrink-0 sm:min-w-[120px]"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" aria-hidden />
            ) : (
              <Search size={16} aria-hidden />
            )}
            {ui.search.submit}
          </Button>
        </form>

        <p className="text-center text-xs text-muted">
          {isTooShort ? ui.search.minLengthHint(MIN_SEARCH_QUERY_LENGTH) : ui.search.hint}
        </p>
      </Card.Content>
    </Card>
  )
}
