import { useTranslation } from '../i18n'
import { Button, Card, Chip } from '@heroui/react'
import { CalendarPlus, ExternalLink } from 'lucide-react'
import type { ReleaseItem } from '../types'
import { CategoryIcon } from './CategoryIcon'
import { getCertaintyLabel } from '../utils/dates'

export function ResultCard({
  item,
  onAddToCalendar,
}: {
  item: ReleaseItem
  onAddToCalendar: (item: ReleaseItem) => void
}) {
  const { ui } = useTranslation()
  const isComics = item.category === 'comics'
  const isReleased = item.isReleased === true

  return (
    <Card className={isReleased ? 'border-success/40' : undefined}>
      <Card.Content className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-5 sm:p-5">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl sm:h-[72px] sm:w-[72px]">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.title}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <div
              className={`flex h-full w-full items-center justify-center ${isComics ? 'bg-warning/15' : 'bg-accent/15'}`}
            >
              <CategoryIcon category={item.category} size={32} />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-start gap-2">
            <h3 className="line-clamp-2 text-base font-semibold sm:line-clamp-1">{item.title}</h3>
            {isReleased && (
              <Chip size="sm" color="success" variant="soft">
                {ui.card.released}
              </Chip>
            )}
            {!isReleased && item.dateCertainty !== 'confirmed' && (
              <Chip size="sm" color="warning" variant="soft">
                {getCertaintyLabel(item.dateCertainty)}
              </Chip>
            )}
          </div>

          <p
            className={`text-sm font-medium ${isReleased ? 'text-success' : ''}`}
          >
            {item.releaseDateLabel ?? ui.card.unknownDate}
          </p>

          {item.platformOrPublisher && (
            <p className="text-xs text-muted">{item.platformOrPublisher}</p>
          )}

          {item.genres && item.genres.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {item.genres.map((genre) => (
                <Chip key={genre} size="sm" variant="soft">
                  {genre}
                </Chip>
              ))}
            </div>
          )}

          {(item.developer || item.publisher) && (
            <div className="space-y-0.5 text-xs text-muted">
              {item.developer && (
                <p>
                  <span className="text-foreground/70">{ui.card.developer} :</span> {item.developer}
                </p>
              )}
              {item.publisher && (
                <p>
                  <span className="text-foreground/70">{ui.card.publisher} :</span> {item.publisher}
                </p>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1">
            <Chip size="sm" color={isComics ? 'warning' : 'accent'} variant="soft">
              {item.source}
            </Chip>
            {item.sourceUrl && (
              <a
                href={item.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted hover:text-foreground inline-flex items-center gap-1 text-xs"
              >
                {ui.card.viewSource}
                <ExternalLink size={11} aria-hidden />
              </a>
            )}
          </div>
        </div>

        <Button
          variant="primary"
          className="w-full shrink-0 sm:w-36"
          onPress={() => onAddToCalendar(item)}
        >
          <CalendarPlus size={15} aria-hidden />
          <span className="truncate">{ui.card.addToCalendar}</span>
        </Button>
      </Card.Content>
    </Card>
  )
}
