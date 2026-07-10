import { Card } from '@heroui/react'

export function ResultCardSkeleton({ showButton = true }: { showButton?: boolean }) {
  return (
    <Card>
      <Card.Content className="flex flex-row items-start gap-4 p-4 sm:items-center sm:gap-5 sm:p-5">
        <div
          className="bg-default h-28 w-28 shrink-0 animate-pulse rounded-xl sm:h-36 sm:w-36"
          aria-hidden
        />

        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-default h-4 w-3/5 max-w-xs animate-pulse rounded" aria-hidden />
            <div className="bg-default h-5 w-16 animate-pulse rounded-full" aria-hidden />
          </div>
          <div className="bg-default h-3.5 w-1/3 animate-pulse rounded" aria-hidden />
          <div className="bg-default h-3 w-2/5 animate-pulse rounded" aria-hidden />
          <div className="flex gap-1.5 pt-1">
            <div className="bg-default h-5 w-14 animate-pulse rounded-full" aria-hidden />
            <div className="bg-default h-5 w-20 animate-pulse rounded-full" aria-hidden />
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <div className="bg-default h-5 w-16 animate-pulse rounded-full" aria-hidden />
            <div className="bg-default h-3 w-14 animate-pulse rounded" aria-hidden />
            <div className="bg-default h-3 w-20 animate-pulse rounded" aria-hidden />
          </div>
        </div>

        {showButton && (
          <div
            className="bg-default h-9 w-28 shrink-0 animate-pulse rounded-xl sm:w-36"
            aria-hidden
          />
        )}
      </Card.Content>
    </Card>
  )
}
