import { ui } from '../i18n'
import type { ReleaseItem, SearchResult } from '../types'
import {
  formatDisplayDate,
  isFutureOrToday,
  matchesSearch,
  parseFrenchDate,
} from '../utils/dates'
import { fetchTextViaProxy } from './cors-proxy'

type ComicsSection = 'bd' | 'comics'

function parseBdfugueProducts(html: string, section: ComicsSection): ReleaseItem[] {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const items: ReleaseItem[] = []

  doc.querySelectorAll('.product-item-info, .product-item').forEach((product, index) => {
    const linkEl = product.querySelector('a.product-item-link, .product-item-link, a')
    const title = linkEl?.textContent?.trim()
    const href = linkEl?.getAttribute('href')
    if (!title) return

    const dateText =
      product.querySelector('[class*="date"], time, .release-date')?.textContent?.trim() ??
      product.textContent?.match(/\d{1,2}\/\d{1,2}\/\d{4}/)?.[0]
    const releaseDate = dateText ? parseFrenchDate(dateText) : undefined

    items.push({
      id: `bdfugue-${section}-${index}-${title}`,
      title,
      releaseDate,
      releaseDateLabel: releaseDate ? formatDisplayDate(releaseDate) : ui.dates.toConfirm,
      dateCertainty: releaseDate ? 'confirmed' : 'unknown',
      dateLocale: 'fr',
      platformOrPublisher: section === 'bd' ? 'BD' : 'Comics',
      source: 'BDfugue',
      sourceUrl: href?.startsWith('http') ? href : href ? `https://www.bdfugue.com${href}` : undefined,
      category: 'comics',
    })
  })

  return items
}

export async function searchComics(query: string): Promise<SearchResult> {
  try {
    const [bd, comics] = await Promise.all([
      fetchTextViaProxy('https://www.bdfugue.com/a-paraitre/bd').then((h) =>
        parseBdfugueProducts(h, 'bd'),
      ),
      fetchTextViaProxy('https://www.bdfugue.com/a-paraitre/comics').then((h) =>
        parseBdfugueProducts(h, 'comics'),
      ),
    ])
    const items = [...bd, ...comics]
      .filter((item) => matchesSearch(item.title, query))
      .filter((item) => isFutureOrToday(item.releaseDate))
      .slice(0, 20)
    return {
      items,
      warning: items.length === 0 ? ui.warnings.bdfugueEmpty : ui.warnings.bdfugueOk,
    }
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'unknown error'
    return { items: [], warning: ui.warnings.bdfugueUnavailable(detail) }
  }
}
