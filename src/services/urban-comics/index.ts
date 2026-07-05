import { fetchHtml } from '../scraper/fetch-html'
import { matchesSearch, normalizeSearchTerm } from '../../utils/dates'
import {
  parseUrbanComicsProductPage,
  parseUrbanComicsSearchLinks,
  queryToProductSlug,
} from './parser'
import type { UrbanComicsFeed, UrbanComicsItem } from './types'
import { URBAN_COMICS_BASE, URBAN_COMICS_SEARCH_URL } from './types'

const MAX_SEARCH_PRODUCTS = 2

function scoreLink(url: string, query: string): number {
  const slug = (url.split('/').filter(Boolean).pop() ?? '').replace(/-/g, ' ')
  const terms = normalizeSearchTerm(query).split(/\s+/).filter(Boolean)
  return terms.filter((term) => slug.includes(term)).length
}

async function fetchProduct(url: string): Promise<UrbanComicsItem | null> {
  const html = await fetchHtml(url)
  return parseUrbanComicsProductPage(html, url)
}

async function fetchBySlug(query: string): Promise<UrbanComicsItem | null> {
  const slug = queryToProductSlug(query)
  if (!slug || slug.length < 5) return null

  try {
    return await fetchProduct(`${URBAN_COMICS_BASE}/${slug}/`)
  } catch {
    return null
  }
}

async function fetchBySearch(query: string): Promise<UrbanComicsItem[]> {
  const searchHtml = await fetchHtml(`${URBAN_COMICS_SEARCH_URL}${encodeURIComponent(query)}`)
  const links = parseUrbanComicsSearchLinks(searchHtml)
    .filter((url) => {
      const slug = url.split('/').filter(Boolean).pop() ?? ''
      return matchesSearch(slug.replace(/-/g, ' '), query)
    })
    .sort((a, b) => scoreLink(b, query) - scoreLink(a, query))
    .slice(0, MAX_SEARCH_PRODUCTS)

  const results = await Promise.all(
    links.map(async (url) => {
      try {
        return await fetchProduct(url)
      } catch {
        return null
      }
    }),
  )

  return results.filter((item): item is UrbanComicsItem => item !== null)
}

export async function searchUrbanComics(query: string): Promise<UrbanComicsFeed> {
  const direct = await fetchBySlug(query)
  if (direct) {
    return { source: 'urbancomics', items: [direct] }
  }

  const items = await fetchBySearch(query)
  return { source: 'urbancomics', items }
}

export { parseUrbanComicsProductPage, parseUrbanComicsSearchLinks, queryToProductSlug } from './parser'
export type { UrbanComicsFeed, UrbanComicsItem } from './types'
