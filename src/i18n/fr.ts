import type { UiMessages } from './types'

export const fr: UiMessages = {
  categories: {
    games: 'Jeux vidéo',
    comics: 'BD / Comics',
  },

  header: {
    tagline: 'Sorties & agenda',
    demoBadge: 'Mode démo',
  },

  hero: {
    subtitle:
      'Repérez les prochaines sorties Jeux vidéos et BD / Comics. Ajoutez-les dans votre agenda en un clic.',
    resultsCount: (count) => `${count} résultat${count > 1 ? 's' : ''}`,
  },

  gamesCalendar: {
    title: 'Calendrier des sorties Jeux vidéo',
    subtitle: '6 prochains mois via IGDB',
    todayTitle: 'Sorties du jour',
    todaySubtitle: 'Les jeux qui sortent aujourd’hui',
    upcomingLabel: 'À venir',
    emptyToday: 'Aucune sortie prévue aujourd’hui.',
    emptyMonth: 'Aucune sortie prévue ce mois-ci.',
    count: (count) => `${count} jeu${count > 1 ? 'x' : ''}`,
  },

  search: {
    placeholder: 'Rechercher une sortie…',
    submit: 'Chercher',
    hint: 'Appuyez sur Entrée ou cliquez sur Chercher.',
    minLengthHint: (min) => `Saisissez au moins ${min} caractères pour lancer une recherche.`,
  },

  empty: {
    noResults: 'Aucun résultat',
    title: 'Trouvez votre prochaine sortie',
    hint: 'Lancez une recherche pour parcourir les sorties à venir.',
    hintDemo:
      'Lancez une recherche ou laissez le champ vide en mode démo pour voir des exemples.',
  },

  card: {
    unknownDate: 'Date inconnue',
    viewSource: 'Fiche',
    enlargeCover: 'Agrandir la cover',
    copyLink: 'Copier le lien',
    linkCopied: 'Lien copié !',
    addToCalendar: 'Ajouter',
    developer: 'Développeur',
    publisher: 'Éditeur',
    released: 'Déjà sorti',
  },

  dates: {
    unknown: 'Date inconnue',
    tba: 'Date à confirmer (TBA)',
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
  },

  warnings: {
    demo:
      'Mode démo actif — données fictives, aucun appel API. Définissez VITE_DEMO_MODE=false dans .env.local pour activer les vraies sources.',
    rawgMissing:
      'Configuration IGDB manquante. Définissez IGDB_CLIENT_ID et IGDB_CLIENT_SECRET côté serveur.',
    rawgUnavailable: (detail) => `IGDB indisponible (${detail}).`,
    gamesCalendarEmpty: 'Aucun jeu à venir sur les 6 prochains mois.',
    comicsEmpty: 'Aucune BD/comics trouvée.',
    comicsOk: (sources) => `Résultats via ${sources.join(', ')}.`,
    upcomingComicsUnavailable: (detail) => `Sources BD/comics indisponibles (${detail}).`,
    queryTooShort: (min) => `Recherche trop courte — saisissez au moins ${min} caractères.`,
  },

  demo: {
    sourceRawg: 'IGDB (démo)',
    sourceUrbanComics: 'Urban Comics (démo)',
    multiPlatform: 'Multi-plateformes',
  },

  calendar: {
    addedVia: 'Ajouté via DropWhen',
    category: (label) => `Catégorie : ${label}`,
    source: (name) => `Source : ${name}`,
    publisher: (name) => `Éditeur / plateforme : ${name}`,
    link: (url) => `Fiche : ${url}`,
    unknownDateNote: 'Date inconnue — événement créé à la date du jour.',
  },

  a11y: {
    dismiss: 'Fermer',
    languageSwitch: 'Langue',
    categorySwitch: 'Catégorie',
    themeSwitch: 'Thème',
  },

  theme: {
    light: 'Clair',
    dark: 'Sombre',
  },

  language: {
    fr: 'FR',
    en: 'EN',
  },
}
