import type { ReleaseType } from '../releases/types'

export interface UrbanComicsItem {
  title: string
  series: string
  volume: string
  type: ReleaseType
  publisher: string
  release_date: string
  cover_url: string
  source_url: string
}

export interface UrbanComicsFeed {
  source: 'urbancomics'
  items: UrbanComicsItem[]
}

export const URBAN_COMICS_BASE = 'https://www.urban-comics.com'
export const URBAN_COMICS_SEARCH_URL = `${URBAN_COMICS_BASE}/?post_type=product&s=`
