import type { Category, DateCertainty } from '../types'

export const ui = {
  categories: {
    games: 'Jeux vidéo',
    manga: 'Manga',
    comics: 'BD / Comics',
  } satisfies Record<Category, string>,

  header: {
    tagline: 'Sorties & agenda',
    demoBadge: 'Mode démo',
  },

  search: {
    placeholder: 'Rechercher une sortie… (vide = tout afficher en démo)',
    submit: 'Chercher',
  },

  empty: {
    noResults: 'Aucun résultat',
    title: 'Trouvez votre prochaine sortie',
    hint: 'Lancez une recherche ou laissez le champ vide en mode démo pour voir des exemples.',
  },

  card: {
    datePrefix: 'Date',
    unknownDate: 'Date inconnue',
    viewSource: 'Fiche',
    addToCalendar: 'Ajouter à mon agenda',
    calendarDemo: 'Agenda (démo)',
    adding: 'Ajout…',
    added: 'Ajouté',
  },

  dates: {
    unknown: 'Date inconnue',
    tba: 'Date à confirmer (TBA)',
    jpUnknown: 'Date JP inconnue',
    frUnknown: 'Date FR inconnue',
    toConfirm: 'Date à confirmer',
    untitled: 'Sans titre',
    certainty: {
      confirmed: 'Date confirmée',
      estimated: 'Date estimée',
      unknown: 'Date incertaine',
    } satisfies Record<DateCertainty, string>,
  },

  banners: {
    demoActive:
      'Mode démo actif — données fictives, zéro appel API. Passez VITE_DEMO_MODE=false dans .env.local quand vous aurez vos clés.',
    googleNotConfigured: 'Google Calendar non configuré (VITE_GOOGLE_CLIENT_ID).',
    demoCalendar:
      'Mode démo : configurez VITE_GOOGLE_CLIENT_ID pour ajouter à l’agenda.',
  },

  errors: {
    searchFailed: 'Erreur de recherche.',
    unexpected: 'Erreur inattendue.',
    calendar: {
      auth: 'Autorisation Google refusée.',
      expired: 'Session expirée.',
      duplicate: 'Un événement similaire existe déjà à cette date.',
      network: 'Erreur Google Calendar.',
      unknown: 'Erreur Google Calendar.',
      missingClientId: 'Client ID Google manquant (VITE_GOOGLE_CLIENT_ID).',
      gisUnavailable: 'Google Identity Services indisponible.',
      invalidToken: 'Token Google invalide.',
      accessDenied: 'Accès Calendar refusé.',
    },
  },

  warnings: {
    demo:
      'Mode démo actif — données fictives, aucun appel API. Définissez VITE_DEMO_MODE=false dans .env.local pour activer les vraies sources.',
    rawgMissing:
      'Clé API RAWG manquante. Obtenez-en une sur rawg.io/apidocs ou gardez VITE_DEMO_MODE=true.',
    rawgUnavailable: (detail: string) => `RAWG indisponible (${detail}).`,
    anilistJpDates: 'Dates de sortie japonaises (AniList).',
    anilistUnavailable: (detail: string) => `AniList indisponible (${detail}).`,
    nautiljonEmpty: 'Aucune sortie FR Nautiljon pour cette recherche.',
    nautiljonFrDates: 'Dates FR via Nautiljon.',
    nautiljonUnavailable: (detail: string) => `Nautiljon indisponible (${detail}).`,
    bdfugueEmpty: 'Aucun résultat BDfugue.',
    bdfugueOk: 'Données via BDfugue (proxy CORS).',
    bdfugueUnavailable: (detail: string) => `BDfugue indisponible (${detail}).`,
  },

  demo: {
    sourceRawg: 'RAWG (démo)',
    sourceNautiljon: 'Nautiljon (démo)',
    sourceAnilist: 'AniList (démo)',
    sourceBdfugue: 'BDfugue (démo)',
    multiPlatform: 'Multi-plateformes',
  },

  calendar: {
    category: (label: string) => `Catégorie : ${label}`,
    source: (name: string) => `Source : ${name}`,
    publisher: (name: string) => `Éditeur / plateforme : ${name}`,
    link: (url: string) => `Fiche : ${url}`,
    unknownDateNote: 'Date inconnue — événement créé à la date du jour.',
  },

  a11y: {
    dismiss: 'Fermer',
  },
} as const

export function getCategoryLabel(category: Category): string {
  return ui.categories[category]
}

export function getCalendarErrorMessage(code: keyof typeof ui.errors.calendar): string {
  return ui.errors.calendar[code]
}
