import { parseFrenchLongDate } from '../../utils/dates'
import type { UrbanComicsItem } from './types'

const BASE_URL = 'https://www.urban-comics.com'

function normalize(text: string | undefined): string {
  return (text ?? '')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .map((part) => (/^\d+$/.test(part) ? part : part.charAt(0).toUpperCase() + part.slice(1)))
    .join(' ')
}

function splitSeriesVolume(title: string): { series: string; volume: string } {
  const tome = title.match(/^(.+?)\s+Tome\s+(\d+[a-z]?)/i)
  if (tome) {
    return { series: tome[1].trim(), volume: tome[2] }
  }
  return { series: title.trim(), volume: '' }
}

export function queryToProductSlug(query: string): string {
  return query
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

export function parseUrbanComicsSearchLinks(html: string): string[] {
  const links = new Set<string>()

  for (const match of html.matchAll(/href="(https:\/\/www\.urban-comics\.com\/([a-z0-9-]+)\/)"/gi)) {
    const url = match[1]
    const slug = match[2]

    if (
      slug.includes('category') ||
      slug.includes('wp-content') ||
      slug.includes('tag') ||
      slug.length < 5 ||
      slug.endsWith('-serie')
    ) {
      continue
    }

    if (
      slug.includes('-tome-') ||
      slug.includes('-integrale') ||
      slug.includes('-coffret') ||
      slug.includes('-omnibus')
    ) {
      links.add(url)
    }
  }

  return [...links]
}

export function parseUrbanComicsProductPage(html: string, sourceUrl: string): UrbanComicsItem | null {
  const slug = sourceUrl.replace(BASE_URL, '').replace(/^\/|\/$/g, '')
  const ogTitle = html.match(/<meta property="og:title" content="([^"]+)"/i)?.[1]
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]
  const rawTitle = normalize(ogTitle || h1 || slugToTitle(slug))
    .replace(/\s*-\s*Urban Comics\s*$/i, '')
    .trim()

  if (!rawTitle || /404|not found/i.test(rawTitle)) return null

  const dateMatch =
    html.match(/Date de sortie\s*:<\/b>\s*([^<]+)/i) ||
    html.match(/Date de sortie\s*:\s*([^<]+)/i)
  const releaseDate = dateMatch ? parseFrenchLongDate(dateMatch[1]) : ''

  const coverMatch =
    html.match(/<meta property="og:image" content="([^"]+)"/i) ||
    html.match(/<img[^>]*src="(https:\/\/[^"]+couv[^"]+)"/i)

  const { series, volume } = splitSeriesVolume(rawTitle)

  return {
    title: rawTitle,
    series,
    volume,
    type: 'comic',
    publisher: 'Urban Comics',
    release_date: releaseDate,
    cover_url: coverMatch?.[1] ?? '',
    source_url: sourceUrl,
  }
}
