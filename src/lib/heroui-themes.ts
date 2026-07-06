export type HeroUiThemeProposal = {
  id: string
  name: string
  description: string
  appearance: 'light' | 'dark'
}

export const HEROUI_THEME_PROPOSALS: HeroUiThemeProposal[] = [
  {
    id: 'violet',
    name: 'Violet',
    description: 'Thème HeroUI par défaut — clair, accent violet moderne.',
    appearance: 'light',
  },
  {
    id: 'blue',
    name: 'Bleu',
    description: 'Indigo froid — sérieux et lisible, orienté productivité.',
    appearance: 'light',
  },
  {
    id: 'teal',
    name: 'Teal',
    description: 'Vert-bleu apaisant — frais et détendu.',
    appearance: 'light',
  },
  {
    id: 'rose',
    name: 'Rose',
    description: 'Accent rose vif — pop culture et comics.',
    appearance: 'light',
  },
  {
    id: 'amber',
    name: 'Ambre',
    description: 'Tons chauds — accueillant, événementiel.',
    appearance: 'light',
  },
  {
    id: 'dark',
    name: 'Sombre',
    description: 'Mode dark violet — confortable le soir.',
    appearance: 'dark',
  },
]

export const DEFAULT_HEROUI_THEME = HEROUI_THEME_PROPOSALS[0]
