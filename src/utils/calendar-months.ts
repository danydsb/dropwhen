import { getIntlLocale, getLocale } from '../i18n'
import type { ReleaseItem } from '../types'
import { isFutureOrToday, isToday } from './dates'

export const UPCOMING_MONTH_COUNT = 6

export interface MonthSection {
  key: string
  label: string
}

function toIsoDateLocal(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function buildUpcomingMonths(count = UPCOMING_MONTH_COUNT): MonthSection[] {
  const locale = getIntlLocale(getLocale())
  const today = new Date()

  return Array.from({ length: count }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth() + index, 1)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const label = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(date)

    return {
      key,
      label: label.charAt(0).toUpperCase() + label.slice(1),
    }
  })
}

export function getUpcomingDateRange(monthCount = UPCOMING_MONTH_COUNT): {
  start: string
  end: string
} {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const endDate = new Date(today.getFullYear(), today.getMonth() + monthCount, 0)

  return {
    start: toIsoDateLocal(today),
    end: toIsoDateLocal(endDate),
  }
}

export function groupReleaseItemsByMonth(
  items: ReleaseItem[],
  months: MonthSection[],
): { todayItems: ReleaseItem[]; sections: Array<{ month: MonthSection; items: ReleaseItem[] }> } {
  const todayItems = items
    .filter((item) => isToday(item.releaseDate))
    .sort((a, b) => a.title.localeCompare(b.title))

  const upcoming = items.filter(
    (item) => isFutureOrToday(item.releaseDate) && !isToday(item.releaseDate),
  )

  const sections = months.map((month) => ({
    month,
    items: upcoming
      .filter((item) => item.releaseDate?.startsWith(month.key))
      .sort((a, b) => (a.releaseDate ?? '').localeCompare(b.releaseDate ?? '')),
  }))

  return { todayItems, sections }
}
