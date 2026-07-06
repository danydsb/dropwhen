import { Button, Card, Chip, Input } from '@heroui/react'
import { CalendarPlus, Gamepad2, Search } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from '../i18n'
import { CONTENT_MAX_WIDTH } from '../lib/layout'
import { HEROUI_THEME_PROPOSALS, type HeroUiThemeProposal } from '../lib/heroui-themes'
import type { Category } from '../types'
import { CategoryTabs } from './CategoryTabs'

function ThemePreviewPanel({ theme }: { theme: HeroUiThemeProposal }) {
  const { ui } = useTranslation()
  const [category, setCategory] = useState<Category>('games')
  const categories: Category[] = ['games', 'comics']

  return (
    <section
      className={`theme-preview ${theme.appearance} bg-background text-foreground border-border border-b py-12 last:border-b-0 sm:py-16`}
      data-theme={theme.id}
    >
      <div className={`mx-auto ${CONTENT_MAX_WIDTH} space-y-8 px-4 sm:px-8`}>
        <header className="text-center">
          <p className="text-muted text-sm font-medium uppercase tracking-[0.2em]">{theme.name}</p>
          <p className="text-muted mt-2 text-sm">{theme.description}</p>
        </header>

        <div className="text-center">
          <h2 className="font-display text-accent text-4xl uppercase tracking-tight sm:text-5xl">
            DropWhen
          </h2>
          <p className="text-muted mx-auto mt-6 max-w-2xl text-center text-base leading-relaxed sm:text-lg">
            {ui.hero.subtitle}
          </p>
        </div>

        <Card>
          <Card.Content className="flex flex-col gap-4 p-4 sm:p-5">
            <CategoryTabs
              category={category}
              categories={categories}
              labels={ui.categories}
              ariaLabel={ui.a11y.categorySwitch}
              onCategoryChange={setCategory}
            />

            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                placeholder={ui.search.placeholder}
                fullWidth
                className="min-w-0 flex-1"
                aria-label={ui.search.placeholder}
              />
              <Button className="shrink-0 sm:min-w-[120px]">
                <Search size={16} aria-hidden />
                {ui.search.submit}
              </Button>
            </div>
          </Card.Content>
        </Card>

        <div className="grid gap-3 sm:grid-cols-2">
          <Card>
            <Card.Content className="flex gap-4 p-4">
              <div className="bg-accent/15 flex size-14 shrink-0 items-center justify-center rounded-xl">
                <Gamepad2 className="text-accent size-6" aria-hidden />
              </div>
              <div className="min-w-0 space-y-2">
                <h3 className="font-semibold">Hollow Knight: Silksong</h3>
                <p className="text-muted text-sm">4 sept. 2025</p>
                <Button size="sm">
                  <CalendarPlus size={15} aria-hidden />
                  {ui.card.addToCalendar}
                </Button>
              </div>
            </Card.Content>
          </Card>

          <Card>
            <Card.Content className="flex gap-4 p-4">
              <div className="bg-warning/15 flex size-14 shrink-0 items-center justify-center rounded-xl">
                <Gamepad2 className="text-warning size-6" aria-hidden />
              </div>
              <div className="min-w-0 space-y-2">
                <h3 className="font-semibold">One Piece — Tome 110</h3>
                <p className="text-muted text-sm">2 oct. 2025</p>
                <div className="flex gap-2">
                  <Chip size="sm" color="warning" variant="soft">
                    BDfugue
                  </Chip>
                </div>
                <Button size="sm" variant="secondary">
                  <CalendarPlus size={15} aria-hidden />
                  {ui.card.addToCalendar}
                </Button>
              </div>
            </Card.Content>
          </Card>
        </div>
      </div>
    </section>
  )
}

export function ThemePreviewPage() {
  return (
    <div className="bg-background text-foreground min-h-dvh">
      <header className={`mx-auto ${CONTENT_MAX_WIDTH} px-4 py-8 text-center sm:px-8 sm:py-12`}>
        <h1 className="text-2xl font-bold">Thèmes HeroUI</h1>
        <p className="text-muted mt-2 text-sm">
          {HEROUI_THEME_PROPOSALS.length} propositions — scroll pour comparer.
        </p>
        <a href="/" className="text-accent mt-4 inline-block text-sm underline-offset-4 hover:underline">
          ← Retour à l&apos;app
        </a>
      </header>

      {HEROUI_THEME_PROPOSALS.map((theme) => (
        <ThemePreviewPanel key={theme.id} theme={theme} />
      ))}
    </div>
  )
}
