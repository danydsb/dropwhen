import type { DateCertainty } from '../types'
import { getIntlLocale, getLocale, getUi } from '../i18n'

export function formatDisplayDate(isoDate?: string): string {
  const ui = getUi()
  if (!isoDate) return ui.dates.unknown
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return ui.dates.unknown
  return new Intl.DateTimeFormat(getIntlLocale(getLocale()), {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export function toIsoDate(
  year?: number | null,
  month?: number | null,
  day?: number | null,
): string | undefined {
  if (!year) return undefined
  const m = month ?? 1
  const d = day ?? 1
  const iso = `${year}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  return Number.isNaN(new Date(iso).getTime()) ? undefined : iso
}

export function parseFrenchDate(dateStr: string): string | undefined {
  const match = dateStr.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (!match) return undefined
  const [, day, month, year] = match
  return toIsoDate(Number(year), Number(month), Number(day))
}

export function parseRssDate(dateStr?: string | null): string | undefined {
  if (!dateStr) return undefined
  const parsed = new Date(dateStr)
  if (Number.isNaN(parsed.getTime())) return undefined
  return parsed.toISOString().slice(0, 10)
}

export function isFutureOrToday(isoDate?: string): boolean {
  if (!isoDate) return true
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(isoDate)
  target.setHours(0, 0, 0, 0)
  return target >= today
}

export function getCertaintyLabel(certainty: DateCertainty): string {
  return getUi().dates.certainty[certainty]
}

export function normalizeSearchTerm(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
}

export function matchesSearch(title: string, query: string): boolean {
  const terms = normalizeSearchTerm(query).split(/\s+/).filter(Boolean)
  if (terms.length === 0) return true
  const normalizedTitle = normalizeSearchTerm(title)
  return terms.every((term) => normalizedTitle.includes(term))
}
