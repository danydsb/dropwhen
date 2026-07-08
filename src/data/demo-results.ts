import { getUi } from '../i18n'
import type { Category, ReleaseItem, SearchResult } from '../types'
import { formatDisplayDate, matchesSearch } from '../utils/dates'

function buildDemoItems(): ReleaseItem[] {
  const ui = getUi()

  return [
    {
      id: 'demo-game-1',
      title: 'Death Stranding 2: On The Beach',
      releaseDate: '2025-06-26',
      releaseDateLabel: formatDisplayDate('2025-06-26'),
      dateCertainty: 'confirmed',
      platformOrPublisher: 'PS5, PC',
      source: ui.demo.sourceRawg,
      sourceUrl: 'https://www.igdb.com',
      category: 'games',
    },
    {
      id: 'demo-game-2',
      title: 'Metroid Prime 4: Beyond',
      releaseDate: '2025-12-31',
      releaseDateLabel: formatDisplayDate('2025-12-31'),
      dateCertainty: 'estimated',
      platformOrPublisher: 'Switch',
      source: ui.demo.sourceRawg,
      category: 'games',
    },
    {
      id: 'demo-game-3',
      title: 'Hollow Knight: Silksong',
      releaseDate: '2025-09-04',
      releaseDateLabel: formatDisplayDate('2025-09-04'),
      dateCertainty: 'confirmed',
      platformOrPublisher: ui.demo.multiPlatform,
      source: ui.demo.sourceRawg,
      category: 'games',
    },
    {
      id: 'demo-comics-1',
      title: 'Batman — Le Court des Hiboux',
      releaseDate: '2025-07-04',
      releaseDateLabel: formatDisplayDate('2025-07-04'),
      dateCertainty: 'confirmed',
      platformOrPublisher: 'Urban Comics',
      source: ui.demo.sourceUrbanComics,
      sourceUrl: 'https://www.urban-comics.com',
      category: 'comics',
    },
    {
      id: 'demo-comics-2',
      title: "Thorgal — La déesse d'Ambre",
      releaseDate: '2025-07-04',
      releaseDateLabel: formatDisplayDate('2025-07-04'),
      dateCertainty: 'confirmed',
      platformOrPublisher: 'BD',
      source: ui.demo.sourceUrbanComics,
      category: 'comics',
    },
    {
      id: 'demo-comics-3',
      title: 'Spider-Man — Intégrale Tome 3',
      releaseDate: '2025-08-15',
      releaseDateLabel: formatDisplayDate('2025-08-15'),
      dateCertainty: 'confirmed',
      platformOrPublisher: 'Comics',
      source: ui.demo.sourceUrbanComics,
      category: 'comics',
    },
  ]
}

export function searchDemo(category: Category, query: string): SearchResult {
  const ui = getUi()
  const items = buildDemoItems().filter(
    (item) => item.category === category && matchesSearch(item.title, query),
  )

  return {
    items,
    warning: ui.warnings.demo,
  }
}
