import { useTranslation } from '../i18n'
import { Button, Card, Chip } from '@heroui/react'
import { CalendarPlus, ExternalLink } from 'lucide-react'
import type { CSSProperties } from 'react'
import type { ReleaseItem } from '../types'
import { CategoryIcon } from './CategoryIcon'
import { CopyLinkButton } from './CopyLinkButton'
import { CoverLightbox } from './CoverLightbox'
import { TruncatedTitle } from './TruncatedTitle'
import { getCertaintyLabel, isFromTomorrowOrLater } from '../utils/dates'

export function ResultCard({
  item,
  onAddToCalendar,
}: {
  item: ReleaseItem
  onAddToCalendar: (item: ReleaseItem) => void
}) {
  const { ui } = useTranslation()
  const isComics = item.category === 'comics'
  const isGames = item.category === 'games'
  const isReleased = item.isReleased === true
  const canAddToCalendar = isFromTomorrowOrLater(item.releaseDate)

  function getGameTypeStyle(typeId?: number): CSSProperties | undefined {
    if (!typeId) return undefined

    // Distinct palette per IGDB game_type id.
    const palette: Record<number, { bg: string; fg: string }> = {
      1: { bg: 'rgba(255, 77, 79, 0.15)', fg: '#ff4d4f' }, // DLC
      2: { bg: 'rgba(255, 159, 67, 0.15)', fg: '#ff9f43' }, // Expansion
      3: { bg: 'rgba(255, 199, 0, 0.16)', fg: '#ffc700' }, // Bundle
      4: { bg: 'rgba(16, 185, 129, 0.15)', fg: '#10b981' }, // Standalone Expansion
      5: { bg: 'rgba(34, 197, 94, 0.15)', fg: '#22c55e' }, // Mod
      6: { bg: 'rgba(132, 204, 22, 0.16)', fg: '#84cc16' }, // Episode
      7: { bg: 'rgba(34, 211, 238, 0.15)', fg: '#22d3ee' }, // Season
      8: { bg: 'rgba(59, 130, 246, 0.15)', fg: '#3b82f6' }, // Remake
      9: { bg: 'rgba(99, 102, 241, 0.15)', fg: '#6366f1' }, // Remaster
      10: { bg: 'rgba(168, 85, 247, 0.15)', fg: '#a855f7' }, // Expanded Game
      11: { bg: 'rgba(244, 63, 94, 0.15)', fg: '#f43f5e' }, // Port
      12: { bg: 'rgba(148, 163, 184, 0.18)', fg: '#94a3b8' }, // Fork
      13: { bg: 'rgba(245, 158, 11, 0.15)', fg: '#f59e0b' }, // Pack / Addon
      14: { bg: 'rgba(124, 58, 237, 0.15)', fg: '#7c3aed' }, // Update
    }

    const entry = palette[typeId]
    if (!entry) return undefined
    return { backgroundColor: entry.bg, color: entry.fg }
  }

  return (
    <Card className={isReleased ? 'border-success/40' : undefined}>
      <Card.Content className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-5 sm:p-5">
        <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl sm:h-36 sm:w-36">
          {item.imageUrl ? (
            <CoverLightbox
              imageUrl={item.imageUrl}
              title={item.title}
              objectFit={isGames ? 'object-contain' : 'object-cover'}
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
          <div className="flex min-w-0 flex-wrap items-start gap-2">
            <TruncatedTitle title={item.title} />
            {item.gameTypeLabel && (
              <Chip size="sm" variant="soft" style={getGameTypeStyle(item.gameTypeId)}>
                {item.gameTypeLabel}
              </Chip>
            )}
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
              <>
                <a
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted hover:text-foreground inline-flex items-center gap-1 text-xs"
                >
                  {ui.card.viewSource}
                  <ExternalLink size={11} aria-hidden />
                </a>
                <CopyLinkButton url={item.sourceUrl} />
              </>
            )}
          </div>
        </div>

        {canAddToCalendar && (
          <Button
            variant="primary"
            className="w-full shrink-0 sm:w-36"
            onPress={() => onAddToCalendar(item)}
          >
            <CalendarPlus size={15} aria-hidden />
            <span className="truncate">{ui.card.addToCalendar}</span>
          </Button>
        )}
      </Card.Content>
    </Card>
  )
}
