import type { DateCertainty } from '../../types'
import { toIsoDate } from '../../utils/dates'

const ENGLISH_MONTHS: Record<string, number> = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
}

export function parseOpenLibraryPublishDate(
  raw: string,
): { iso?: string; certainty: DateCertainty } {
  const trimmed = raw.trim()
  if (!trimmed) return { certainty: 'unknown' }

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return { iso: trimmed, certainty: 'confirmed' }
  }

  if (/^\d{4}$/.test(trimmed)) {
    return { iso: toIsoDate(Number(trimmed)), certainty: 'estimated' }
  }

  const englishMatch = trimmed.match(/^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})$/)
  if (englishMatch) {
    const month = ENGLISH_MONTHS[englishMatch[1].toLowerCase()]
    const day = Number(englishMatch[2])
    const year = Number(englishMatch[3])
    if (month) {
      const iso = toIsoDate(year, month, day)
      if (iso) return { iso, certainty: 'confirmed' }
    }
  }

  const yearInText = trimmed.match(/\b(19|20)\d{2}\b/)
  if (yearInText) {
    return { iso: toIsoDate(Number(yearInText[0])), certainty: 'estimated' }
  }

  return { certainty: 'unknown' }
}
