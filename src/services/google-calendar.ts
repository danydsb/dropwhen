import { getCategoryLabel, getUi } from '../i18n'
import type { ReleaseItem } from '../types'

const CALENDAR_BASE = 'https://calendar.google.com/calendar/render'

function toGoogleDate(isoDate: string): string {
  return isoDate.replace(/-/g, '')
}

function addDays(isoDate: string, days: number): string {
  const date = new Date(isoDate)
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

function buildEventDescription(item: ReleaseItem): string {
  const ui = getUi()
  const lines = [
    ui.calendar.category(getCategoryLabel(item.category)),
    ui.calendar.source(item.source),
    item.platformOrPublisher ? ui.calendar.publisher(item.platformOrPublisher) : null,
    item.sourceUrl ? ui.calendar.link(item.sourceUrl) : null,
  ].filter(Boolean)

  if (!item.releaseDate) {
    lines.push('', ui.calendar.unknownDateNote)
  }

  return lines.join('\n')
}

function buildAllDayDates(releaseDate?: string): string {
  const start = releaseDate ?? new Date().toISOString().slice(0, 10)
  const end = addDays(start, 1)
  return `${toGoogleDate(start)}/${toGoogleDate(end)}`
}

export function buildGoogleCalendarUrl(item: ReleaseItem): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `[DropWhen] ${item.title}`,
    details: buildEventDescription(item),
    dates: buildAllDayDates(item.releaseDate),
  })

  return `${CALENDAR_BASE}?${params.toString()}`
}
