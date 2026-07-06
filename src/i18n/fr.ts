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
    subtitle: '6 prochains mois via RAWG',
    emptyMonth: 'Aucune sortie prévue ce mois-ci.',
    count: (count) => `${count} jeu${count > 1 ? 'x' : ''}`,
  },

  search: {
    placeholder: 'Rechercher une sortie…',
    submit: 'Chercher',
    hint: 'Appuyez sur Entrée ou cliquez sur Chercher.',
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
    addToCalendar: 'Ajouter',
    developer: 'Développeur',
    publisher: 'Éditeur',
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
    popupBlocked: 'Popup bloquée — autorisez les fenêtres pop-up pour ouvrir Google Agenda.',
  },

  warnings: {
    demo:
      'Mode démo actif — données fictives, aucun appel API. Définissez VITE_DEMO_MODE=false dans .env.local pour activer les vraies sources.',
    rawgMissing:
      'Clé API RAWG manquante. Obtenez-en une sur rawg.io/apidocs ou gardez VITE_DEMO_MODE=true.',
    rawgUnavailable: (detail) => `RAWG indisponible (${detail}).`,
    gamesCalendarOk: 'Calendrier des sorties jeux via RAWG.',
    gamesCalendarEmpty: 'Aucun jeu à venir sur les 6 prochains mois.',
    upcomingComicsEmpty: 'Aucune sortie BD/comics trouvée.',
    upcomingComicsOk: (sources) =>
      `Sorties à paraître via ${sources.join(', ')}.`,
    upcomingComicsUnavailable: (detail) => `Sources BD/comics indisponibles (${detail}).`,
  },

  demo: {
    sourceRawg: 'RAWG (démo)',
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
  },

  language: {
    fr: 'FR',
    en: 'EN',
  },
}
