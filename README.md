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

### Jeux vidéo — IGDB (via proxy serveur)

| Critère | IGDB (proxy serveur) | RAWG |
|--------|------|------|
| Auth | OAuth2 client credentials + client secret (côté serveur) | Clé API en query param |
| Navigateur | Appels via `/api/igdb-proxy` (pas de secret exposé) | Clé visible côté client |
| Données | Très riche (plateformes, visuels, dates) | Riche |

**Décision : IGDB** — intégré via un proxy serveur (`/api/igdb-proxy`) pour éviter l'exposition du secret Twitch et contourner les restrictions CORS.

**CORS :** IGDB ne permet pas les appels navigateur directs. Tous les appels jeux passent par le proxy serveur local/Vercel.

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
| **CORS** | IGDB passe par un proxy serveur dédié ; Nautiljon (RSSHub) et BDfugue peuvent encore nécessiter un proxy selon la source. |
| **Dates manga** | AniList = dates JP ; Nautiljon = dates FR volumes (couverture partielle du catalogue). |
| **Scraping BDfugue** | Structure HTML susceptible de changer ; parsing best-effort. |
| **Secrets** | `IGDB_CLIENT_SECRET` doit rester côté serveur. `VITE_GOOGLE_CLIENT_ID` reste côté client (normal pour OAuth public). |
| **Proxy public** | Non recommandé en production critique ; préférez votre propre proxy (Cloudflare Worker, etc.). |

---

## Variables d'environnement

Copiez `.env.example` vers `.env.local` :

```bash
cp .env.example .env.local
```

| Variable | Obligatoire | Description |
|----------|-------------|-------------|
| `IGDB_CLIENT_ID` | Oui (jeux) | Client ID Twitch/IGDB (serveur) |
| `IGDB_CLIENT_SECRET` | Oui (jeux) | Client secret Twitch/IGDB (serveur) |
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

- `IGDB_CLIENT_ID`
- `IGDB_CLIENT_SECRET`
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
