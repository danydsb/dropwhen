import { getCategoryLabel, getUi } from '../i18n'
import type { ReleaseItem } from '../types'

const CALENDAR_BASE = 'https://calendar.google.com/calendar/render'
const EVENT_HOUR = 12
const EVENT_DURATION_MINUTES = 60

function toGoogleDate(isoDate: string): string {
  return isoDate.replace(/-/g, '')
}

function padTime(value: number): string {
  return String(value).padStart(2, '0')
}

function buildTimedDates(releaseDate?: string): string {
  const date = releaseDate ?? new Date().toISOString().slice(0, 10)
  const day = toGoogleDate(date)
  const startHour = padTime(EVENT_HOUR)
  const endHour = padTime(EVENT_HOUR + Math.floor(EVENT_DURATION_MINUTES / 60))
  const endMinute = padTime(EVENT_DURATION_MINUTES % 60)

  return `${day}T${startHour}0000/${day}T${endHour}${endMinute}00`
}

function buildEventDescription(item: ReleaseItem): string {
  const ui = getUi()
  const lines = [
    ui.calendar.addedVia,
    '',
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

export function buildGoogleCalendarUrl(item: ReleaseItem): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: item.title,
    details: buildEventDescription(item),
    dates: buildTimedDates(item.releaseDate),
  })

  return `${CALENDAR_BASE}?${params.toString()}`
}
