# 🎬 Moodflix

A modern movie & TV show discovery and tracking app — browse trending and popular titles, dive into rich detail pages, and build your own Watchlist, Favorites, and custom Lists. Built with Next.js 15, Prisma, and TMDB.

**🔗 Live demo:** [moodflix-5xgh.onrender.com](https://moodflix-5xgh.onrender.com/)

> ⏳ Hosted on Render's free tier — the first request after a period of inactivity may take up to a minute to spin up.

---

## ✨ Features

- **Discovery & browsing** — infinite-scroll grids for movies and TV shows, with filtering and sorting driven by URL search params
- **Rich detail pages** — hero banners, rating rings, cast lists, season breakdowns, backdrop galleries, and recommendations
- **Authentication** — email/password auth via Better Auth, with session-aware navigation and profile management
- **Lists system**
  - Default **Watchlist** and **Favorites** lists auto-created on sign-up
  - Create unlimited **custom lists**
  - Quick-add actions from cards and detail pages, with optimistic UI updates
- **Personalized homepage** — curated carousel rows (Trending, Popular, Top Rated, etc.) with favorited items highlighted
- **Responsive design** — built with Tailwind CSS and shadcn/ui

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 15](https://nextjs.org/) (App Router), TypeScript |
| Styling / UI | [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/) |
| Data fetching | [TanStack Query](https://tanstack.com/query) (client), Server Components (server) |
| Database | [Neon](https://neon.tech/) (serverless PostgreSQL) |
| ORM | [Prisma 7](https://www.prisma.io/) with `@prisma/adapter-neon` |
| Auth | [Better Auth](https://www.better-auth.com/) |
| Forms & validation | React Hook Form + [Zod](https://zod.dev/) |
| External data | [TMDB API](https://www.themoviedb.org/documentation/api) (read-only, proxied server-side) |
| Deployment | [Render](https://render.com/) |

---

## 🏗️ Architecture

Moodflix follows a **feature-based (vertical slice) architecture**: domain logic lives in `features/<name>/`, each owning its own `actions.ts`, `queries.ts`, `hooks.ts`, `schema.ts`, `types.ts`, and `components/`. Shared, cross-feature pieces graduate to the root `components/` folder; pure infrastructure (TMDB client, Prisma client) lives in `services/` with zero business logic.

```
moodflix/
├── app/                 # Route groups: (marketing), (auth), (app), api/
├── features/            # watchlist, favorites, lists, media — vertical slices
├── components/          # ui/ (shadcn), shared/, media/ (cross-feature)
├── services/             # tmdb/, db/ — infrastructure only
├── lib/                  # auth, query client, constants
├── utils/                # pure helper functions
├── hooks/                # generic client-only hooks
├── types/                # shared domain types
└── prisma/               # schema, migrations, seed
```

All TMDB access is proxied through a server-side API route (`app/api/tmdb/[...path]`) — the client never talks to TMDB directly, and the API key is never exposed.

For the full architectural rationale and conventions, see [`CLAUDE.md`](./CLAUDE.md) and [`AGENT.md`](./AGENT.md).

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18.18 or later
- A [Neon](https://neon.tech/) PostgreSQL database (or any Postgres instance)
- A [TMDB API](https://www.themoviedb.org/settings/api) read access token

### Installation

```bash
# Clone the repository
git clone https://github.com/<your-username>/moodflix.git
cd moodflix

# Install dependencies
npm install

# Set up environment variables (see below)
cp .env.example .env

# Run database migrations
npx prisma migrate dev

# Start the dev server
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

---

## 🔐 Environment Variables

Create a `.env` file in the project root with the following variables:

| Variable | Description |
|---|---|
| `TMDB_API_TOKEN` | Your TMDB **API Read Access Token** (v4 auth). Generate one for free from the [TMDB API settings page](https://www.themoviedb.org/settings/api) — requires a free TMDB account. |
| `DATABASE_URL` | Pooled Postgres connection string, used by the app at runtime. If you're on Neon, this is the **pooled** connection string from your project dashboard. |
| `DATABASE_URL_UNPOOLED` | Direct (non-pooled) Postgres connection string, required by Prisma for migrations (`prisma migrate dev`). On Neon, this is the **direct** connection string. |
| `BETTER_AUTH_SECRET` | A random secret used to sign and encrypt sessions/tokens. Generate one with `openssl rand -base64 32`. |
| `BETTER_AUTH_URL` | The base URL of your app (e.g. `http://localhost:3000` locally, or your production URL when deployed). Used by Better Auth to build callback and redirect URLs. |

```bash
# .env.example
TMDB_API_TOKEN=
DATABASE_URL=
DATABASE_URL_UNPOOLED=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000
```

> ⚠️ Never commit your `.env` file. `DATABASE_URL` and `DATABASE_URL_UNPOOLED` are only referenced inside `services/` and `lib/` — never inlined in components or actions.

---

## 📦 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build the app for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npx prisma studio` | Open Prisma Studio to inspect the database |
| `npx prisma migrate dev` | Run database migrations locally |

---

## 🗄️ Data Model

TMDB remains the source of truth for content metadata. The database only stores the relationship between a user and a TMDB item, plus enough cached fields (title, poster path, release year) to render lists instantly without re-hitting TMDB.

- **User** — auth identity, with a default Watchlist and Favorites list auto-created on sign-up
- **List** — `WATCHLIST` | `FAVORITE` | `CUSTOM`, owned by a user
- **ListItem** — caches `tmdbId`, `mediaType`, `title`, `posterPath`, `releaseYear`

---

## 🗺️ Roadmap

- [ ] Differentiate "Trending" vs. "Popular" sort keys in the discover schema
- [ ] Extract a shared `ExpandToggle` component
- [ ] AI-powered recommendation system (Phase 2)

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE).

---

## 🙏 Acknowledgements

- Content and media data provided by [The Movie Database (TMDB)](https://www.themoviedb.org/). This product uses the TMDB API but is not endorsed or certified by TMDB.