import type { UiMessages } from './types'

export const fr: UiMessages = {
  categories: {
    games: 'Jeux vidéo',
    manga: 'Manga',
    comics: 'BD / Comics',
  },

  header: {
    tagline: 'Sorties & agenda',
    demoBadge: 'Mode démo',
  },

  hero: {
    subtitle:
      'Repérez les prochaines sorties jeux, manga et BD. Ajoutez-les à votre agenda en un clic.',
    resultsCount: (count) => `${count} résultat${count > 1 ? 's' : ''}`,
  },

  search: {
    placeholder: 'Rechercher une sortie…',
    submit: 'Chercher',
  },

  empty: {
    noResults: 'Aucun résultat',
    title: 'Trouvez votre prochaine sortie',
    hint: 'Lancez une recherche pour parcourir les sorties à venir.',
    hintDemo:
      'Lancez une recherche ou laissez le champ vide en mode démo pour voir des exemples.',
  },

  card: {
    datePrefix: 'Date',
    unknownDate: 'Date inconnue',
    viewSource: 'Fiche',
    addToCalendar: 'Ouvrir dans Google Agenda',
    developer: 'Développeur',
    publisher: 'Éditeur',
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
    },
  },

  banners: {
    demoActive:
      'Mode démo actif — données fictives, zéro appel API. Passez VITE_DEMO_MODE=false dans .env.local pour utiliser les sources live.',
  },

  errors: {
    searchFailed: 'Erreur de recherche.',
    unexpected: 'Erreur inattendue.',
    popupBlocked: 'Popup bloquée — autorisez les fenêtres pop-up pour ouvrir Google Agenda.',
  },

  warnings: {
    demo:
      'Mode démo actif — données fictives, aucun appel API. Définissez VITE_DEMO_MODE=false dans .env.local pour activer les vraies sources.',
    rawgMissing:
      'Clé API RAWG manquante. Obtenez-en une sur rawg.io/apidocs ou gardez VITE_DEMO_MODE=true.',
    rawgUnavailable: (detail) => `RAWG indisponible (${detail}).`,
    jikanDates: 'Dates via MyAnimeList (Jikan).',
    jikanUnavailable: (detail) => `Jikan indisponible (${detail}).`,
    bdfugueEmpty: 'Aucun résultat BDfugue.',
    bdfugueOk: 'Données via BDfugue (proxy CORS).',
    bdfugueUnavailable: (detail) => `BDfugue indisponible (${detail}).`,
  },

  demo: {
    sourceRawg: 'RAWG (démo)',
    sourceJikan: 'Jikan (démo)',
    sourceBdfugue: 'BDfugue (démo)',
    multiPlatform: 'Multi-plateformes',
  },

  calendar: {
    category: (label) => `Catégorie : ${label}`,
    source: (name) => `Source : ${name}`,
    publisher: (name) => `Éditeur / plateforme : ${name}`,
    link: (url) => `Fiche : ${url}`,
    unknownDateNote: 'Date inconnue — événement créé à la date du jour.',
  },

  a11y: {
    dismiss: 'Fermer',
    languageSwitch: 'Langue',
  },

  language: {
    fr: 'FR',
    en: 'EN',
  },
}
