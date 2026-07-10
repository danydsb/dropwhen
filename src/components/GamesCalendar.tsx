import { useTranslation } from "../i18n";
import { Card, Chip } from "@heroui/react";
import { CalendarDays, Rocket } from "lucide-react";
import { UPCOMING_MONTH_COUNT } from "../utils/calendar-months";
import type { ReleaseItem } from "../types";
import { formatDisplayDate, getTodayIso } from "../utils/dates";
import { ResultCard } from "./ResultCard";
import { ResultCardSkeleton } from "./ResultCardSkeleton";

function MonthSkeleton() {
  return (
    <div className="space-y-3">
      <div className="bg-default h-6 w-40 animate-pulse rounded-lg" />
      {Array.from({ length: 2 }).map((_, index) => (
        <ResultCardSkeleton key={index} showButton={false} />
      ))}
    </div>
  );
}

function TodaySkeleton() {
  return (
    <div className="border-accent/50 from-accent/15 via-accent/8 relative space-y-4 overflow-hidden rounded-2xl border-2 bg-linear-to-br to-transparent p-5 sm:p-6">
      <div
        className="bg-accent/20 pointer-events-none absolute -top-10 -right-10 size-36 rounded-full blur-3xl"
        aria-hidden
      />
      <div className="relative flex items-start gap-3">
        <div className="bg-default size-11 shrink-0 animate-pulse rounded-xl" />
        <div className="space-y-2">
          <div className="bg-default h-7 w-48 animate-pulse rounded-lg" />
          <div className="bg-default h-4 w-36 animate-pulse rounded" />
        </div>
      </div>
      <ResultCardSkeleton showButton={false} />
    </div>
  );
}

function TodaySection({
  items,
  onAddToCalendar,
}: {
  items: ReleaseItem[];
  onAddToCalendar: (item: ReleaseItem) => void;
}) {
  const { ui } = useTranslation();
  const todayLabel = formatDisplayDate(getTodayIso());

  return (
    <div className="border-accent/55 from-accent/18 via-accent/10 shadow-accent/20 relative overflow-hidden rounded-2xl border-2 bg-linear-to-br to-transparent p-5 shadow-lg sm:p-6">
      <div
        className="bg-accent/25 pointer-events-none absolute -top-14 -right-14 size-48 rounded-full blur-3xl"
        aria-hidden
      />
      <div
        className="bg-accent/10 pointer-events-none absolute -bottom-10 -left-10 size-32 rounded-full blur-2xl"
        aria-hidden
      />

      <header className="relative mb-4 flex items-start gap-3 sm:mb-5 sm:gap-4">
        <div className="bg-accent/25 ring-accent/40 flex size-12 shrink-0 items-center justify-center rounded-2xl ring-2 sm:size-14">
          <Rocket size={24} className="text-accent" aria-hidden />
        </div>

        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-accent text-lg font-semibold sm:text-xl">
              {ui.gamesCalendar.todayTitle}
            </h3>
            {items.length > 0 && (
              <Chip size="sm" color="accent" variant="soft">
                {ui.gamesCalendar.count(items.length)}
              </Chip>
            )}
          </div>
          <p className="text-foreground text-sm font-semibold sm:text-base">
            {todayLabel}
          </p>
          <p className="text-muted text-xs sm:text-sm">
            {ui.gamesCalendar.todaySubtitle}
          </p>
        </div>
      </header>

      {items.length === 0 ? (
        <Card className="relative border-dashed border-accent/30 bg-background/70 text-center">
          <Card.Content className="px-4 py-6">
            <p className="text-muted text-sm">{ui.gamesCalendar.emptyToday}</p>
          </Card.Content>
        </Card>
      ) : (
        <div className="relative space-y-3">
          {items.map((item) => (
            <ResultCard
              key={item.id}
              item={item}
              onAddToCalendar={onAddToCalendar}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function GamesCalendar({
  todayItems,
  sections,
  loading,
  onAddToCalendar,
}: {
  todayItems: ReleaseItem[];
  sections: Array<{
    month: { key: string; label: string };
    items: ReleaseItem[];
  }>;
  loading: boolean;
  onAddToCalendar: (item: ReleaseItem) => void;
}) {
  const { ui } = useTranslation();

  if (loading) {
    return (
      <div className="space-y-8">
        <TodaySkeleton />
        <div className="border-border/60 flex items-center gap-3" aria-hidden>
          <span className="bg-border h-px flex-1" />
          <span className="bg-default h-3 w-16 animate-pulse rounded" />
          <span className="bg-border h-px flex-1" />
        </div>
        <div className="space-y-1">
          <div className="bg-default h-6 w-48 animate-pulse rounded-lg" />
          <div className="bg-default h-4 w-64 animate-pulse rounded" />
        </div>
        {Array.from({ length: UPCOMING_MONTH_COUNT }).map((_, index) => (
          <MonthSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <section className="space-y-8">
      <TodaySection items={todayItems} onAddToCalendar={onAddToCalendar} />

      <div className="border-border/60 flex items-center gap-3" aria-hidden>
        <span className="bg-border h-px flex-1" />
        <span className="text-muted text-xs font-medium tracking-wide uppercase">
          {ui.gamesCalendar.upcomingLabel}
        </span>
        <span className="bg-border h-px flex-1" />
      </div>

      <header className="space-y-1">
        <div className="flex items-center gap-2">
          <CalendarDays size={18} className="text-accent" aria-hidden />
          <h2 className="text-lg font-semibold">{ui.gamesCalendar.title}</h2>
        </div>
        <p className="text-muted text-sm">{ui.gamesCalendar.subtitle}</p>
      </header>

      {sections.map(({ month, items }) => (
        <div key={month.key} className="space-y-3">
          <div className="flex items-center gap-3">
            <span
              className="bg-accent size-2 shrink-0 rounded-full"
              aria-hidden
            />
            <h3 className="text-base font-semibold capitalize">
              {month.label}
            </h3>
            <span className="text-muted text-xs">
              {ui.gamesCalendar.count(items.length)}
            </span>
          </div>

          {items.length === 0 ? (
            <Card className="border-dashed text-center">
              <Card.Content className="px-4 py-6">
                <p className="text-muted text-sm">
                  {ui.gamesCalendar.emptyMonth}
                </p>
              </Card.Content>
            </Card>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <ResultCard
                  key={item.id}
                  item={item}
                  onAddToCalendar={onAddToCalendar}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </section>
  );
}
