import type { UiMessages } from './types'

export const fr: UiMessages = {
  categories: {
    games: 'Jeux vidéo',
    comics: 'BD / Comics',
    content: 'Contenus & saisons',
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
    subtitle: 'Les jeux attendus des 6 prochains mois (AAA, AA et indés suivis) via IGDB',
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

  comicsCalendar: {
    title: 'À paraître en France',
    intro:
      'Les prochaines sorties BD et manga annoncées par les éditeurs (Glénat pour l’instant), sur les trois prochains mois. Tapez un titre pour chercher aussi dans les autres sources.',
    all: 'Tout',
    manga: 'Manga',
    bd: 'BD',
    specialOnly: 'Éditions spéciales',
    count: (count) => `${count} sortie${count > 1 ? 's' : ''}`,
    empty: 'Rien d’annoncé pour ce filtre.',
    partialWarning: (sources) => `Certains éditeurs sont indisponibles pour l’instant (${sources}).`,
  },

  content: {
    kinds: {
      dlc: 'DLC',
      expansion: 'Extension',
      season: 'Saison',
      patch: 'Patch',
      update: 'Mise à jour',
      pack: 'Pack',
      set: 'Set',
      launch: 'Lancement',
    },
    nowTitle: 'En ce moment',
    laterTitle: 'Plus tard',
    allGames: 'Tous',
    filterLabel: 'Filtrer par jeu',
    mythicPlusSeason: (number) => `Mythique+ · Saison ${number}`,
    patch: (number) => `Patch ${number}`,
    ongoingUntil: (date) => `En cours jusqu’au ${date}`,
    ongoingSince: (date) => `En cours depuis le ${date}`,
    ongoing: 'En cours',
    emptyNow: 'Rien de neuf ces dernières semaines.',
    emptyMonth: 'Rien d’annoncé pour l’instant.',
    count: (count) => `${count} contenu${count > 1 ? 's' : ''}`,
    intro:
      'Saisons, DLC, extensions et patchs des jeux qu’on suit. Les éditeurs annoncent souvent leurs saisons quelques semaines avant : les mois lointains se remplissent au fil de l’eau.',
    partialWarning: (sources) => `Certaines sources sont indisponibles pour l’instant (${sources}).`,
    tftSet: (number, name) => (name ? `Set ${number} · ${name}` : `Set ${number}`),
    season: (number) => `Saison ${number}`,
    tbd: 'TBD',
    tbdLong: 'Date à venir (TBD)',
    tbdSummary: 'Annoncé officiellement, mais la date n’est pas encore publiée.',
    previewOn: (date) => `Présentation officielle prévue le ${date}.`,
    endOfYear: (year) => `Fin ${year}`,
    poe2Launch: (league) => (league ? `Version 1.0 · ${league}` : 'Version 1.0'),
    poe2LaunchSummary: (league) =>
      league
        ? `Sortie de la version 1.0, avec la nouvelle ligue « ${league} ».`
        : 'Sortie de la version 1.0, avec une nouvelle ligue.',
    patchNotes: 'Patch notes',
    officialPage: 'Page officielle',
  },

  mag: {
    issue: (monthLabel) => `N° ${monthLabel}`,
    mostAnticipated: 'Le plus attendu du moment',
    countdown: (days) => (days <= 0 ? 'Jour J' : `J-${days}`),
    countdownUnit: (days) => (days === 1 ? 'demain !' : days <= 0 ? 'aujourd’hui !' : 'jours'),
    addToCalendar: 'Dans mon agenda',
    followers: (count) => `${count} joueur${count > 1 ? 's' : ''} l’attend${count > 1 ? 'ent' : ''} sur IGDB`,
    trailer: 'Trailer',
    steam: 'Page Steam',
    viewSource: (source) => `Fiche ${source}`,
    previousImage: 'Image précédente',
    nextImage: 'Image suivante',
    close: 'Fermer',
    noImages: 'Pas encore d’images pour celui-là.',
    released: 'Sorti',
    hype: 'hype !!',
    openDetails: (title) => `Voir la fiche de ${title}`,
    fullRelease: 'Sortie 1.0',
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
