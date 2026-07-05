# DropWhen

**DropWhen** est une PWA 100 % front-end pour rechercher les dates de sortie de **jeux vidéo**, **manga** et **BD/comics**, puis créer manuellement un événement dans **Google Agenda**.

Aucun backend, aucune base de données : déployable en statique sur Vercel, Netlify ou GitHub Pages.

## Fonctionnalités

- Barre de recherche unique avec sélecteur de catégorie
- Résultats en cartes : titre, visuel, date, plateforme/éditeur, source
- Bouton « Ajouter à mon agenda » via Google Calendar API (OAuth2 côté client)
- PWA installable (manifest + service worker via `vite-plugin-pwa`)
- Design mobile-first avec identité visuelle par catégorie

## Stack

- React 19 + TypeScript + Vite 8
- Tailwind CSS 4
- [Lucide React](https://lucide.dev/) (icônes UI)
- Google Identity Services (OAuth2 token client)
- Service worker Workbox (cache assets + APIs)

---

## Choix des sources de données

### Jeux vidéo — RAWG (retenu)

| Critère | RAWG | IGDB |
|--------|------|------|
| Auth | Clé API en query param | OAuth2 client credentials + **client secret** |
| Navigateur | Possible avec clé `VITE_*` (exposée côté client) | **Bloqué** : pas de CORS, secret serveur obligatoire |
| Données | Riche (plateformes, visuels, dates) | Très riche mais réservé au server-side |

**Décision : RAWG** — seule option viable sans backend pour un site statique. La clé API reste visible dans le bundle (limitation acceptée pour un projet personnel ; quota RAWG ~20 000 req/mois).

**CORS :** RAWG peut bloquer certaines requêtes cross-origin selon l’environnement. Le projet tente d’abord un fetch direct, puis bascule sur un **proxy CORS configurable** (`VITE_CORS_PROXY`, par défaut AllOrigins).

### Manga — AniList + Nautiljon

1. **AniList (GraphQL)** — recherche directe depuis le navigateur (CORS OK). Fournit les **dates de sortie japonaises** (badge « Date JP » dans l’UI).
2. **Nautiljon (France)** — pas de flux RSS natif ; route communautaire **RSSHub** : `/nautiljon/releases/manga`. Récupéré via proxy CORS. Dates de **parution française** (badge « Date FR »).

Les résultats Nautiljon (FR) sont affichés en priorité ; AniList complète avec les dates JP.

### BD / Comics — BDfugue

**BDfugue** retenu comme référence francophone (pages « à paraître ») :

- https://www.bdfugue.com/a-paraitre/bd
- https://www.bdfugue.com/a-paraitre/comics

Pas de flux RSS public officiel (newsletters e-mail uniquement). Les données sont extraites du HTML via **proxy CORS**. Vérifiez les [CGU BDfugue](https://www.bdfugue.com/) avant un usage intensif.

**Alternatives évaluées :** Momie, Pulp's Comics — pas de RSS stable identifié ; parsing HTML soumis aux mêmes contraintes CORS.

---

## Limites connues

| Limite | Détail |
|--------|--------|
| **CORS** | RAWG, Nautiljon (RSSHub), BDfugue nécessitent souvent un proxy public (AllOrigins). Fiabilité variable, rate limits, risque de blocage. |
| **Dates manga** | AniList = dates JP ; Nautiljon = dates FR volumes (couverture partielle du catalogue). |
| **Scraping BDfugue** | Structure HTML susceptible de changer ; parsing best-effort. |
| **Clés API exposées** | `VITE_RAWG_API_KEY` et `VITE_GOOGLE_CLIENT_ID` sont incluses dans le bundle client. |
| **Proxy public** | Non recommandé en production critique ; préférez votre propre proxy (Cloudflare Worker, etc.). |

---

## Variables d'environnement

Copiez `.env.example` vers `.env.local` :

```bash
cp .env.example .env.local
```

| Variable | Obligatoire | Description |
|----------|-------------|-------------|
| `VITE_RAWG_API_KEY` | Oui (jeux) | Clé API [RAWG](https://rawg.io/apidocs) |
| `VITE_GOOGLE_CLIENT_ID` | Oui (agenda) | Client ID OAuth Google (type « Application Web ») |
| `VITE_CORS_PROXY` | Non | Préfixe proxy CORS (défaut : `https://api.allorigins.win/raw?url=`) |
| `VITE_RSSHUB_BASE` | Non | Instance RSSHub (défaut : `https://rsshub.app`) |

### Configuration Google Calendar

1. [Google Cloud Console](https://console.cloud.google.com/) → créer un projet
2. Activer **Google Calendar API**
3. Créer des identifiants OAuth 2.0 → **Application Web**
4. Origines JavaScript autorisées : `http://localhost:5173`, `https://votre-domaine.vercel.app`
5. Copier le **Client ID** dans `VITE_GOOGLE_CLIENT_ID`

Scope utilisé : `https://www.googleapis.com/auth/calendar.events`

---

## Développement local

```bash
npm install
cp .env.example .env.local
# Renseigner les clés dans .env.local
npm run dev
```

Ouvrir http://localhost:5173

## Build

```bash
npm run build
npm run preview
```

Vercel exécute `npm run build` automatiquement (détection Vite native, **sans `vercel.json` requis**).

---

## Déploiement (GitHub + Vercel)

### 1. Pousser sur GitHub

```bash
git init
git add .
git commit -m "Initial commit — DropWhen PWA"
git branch -M main
git remote add origin https://github.com/VOTRE_USER/dropwhen.git
git push -u origin main
```

### 2. Importer dans Vercel

1. [vercel.com](https://vercel.com) → **Add New Project**
2. Importer le dépôt GitHub `dropwhen`
3. Framework preset : **Vite** (auto-détecté)
4. Build command : `npm run build` · Output : `dist`

### 3. Variables d'environnement Vercel

Dans **Settings → Environment Variables**, ajouter :

- `VITE_RAWG_API_KEY`
- `VITE_GOOGLE_CLIENT_ID`
- (optionnel) `VITE_CORS_PROXY`, `VITE_RSSHUB_BASE`

Redéployer si les variables sont ajoutées après le premier déploiement.

### 4. Mises à jour continues

Chaque `git push` sur `main` déclenche un **redéploiement automatique** Vercel. Aucune action manuelle supplémentaire.

### 5. Google OAuth en production

Ajoutez l’URL Vercel (`https://xxx.vercel.app`) aux **origines JavaScript autorisées** du Client ID Google.

---

## Scripts npm

| Commande | Action |
|----------|--------|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build production (`dist/`) |
| `npm run preview` | Prévisualiser le build |
| `npm run lint` | Lint (oxlint) |

---

## Licence

MIT
