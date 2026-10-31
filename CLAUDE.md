# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

Moodflix is a movie and TV discovery and tracking app. Users browse TMDB content, keep lists, rate titles, write reviews, and get mood-based recommendations from an LLM.

Stack: Next.js 16 (App Router), React 19, TypeScript, Tailwind 4 with shadcn/ui, TanStack Query, Prisma 7 on Neon Postgres, Better Auth, Zod 4, Tiptap, Cloudinary, Groq.

## Commands

```bash
npm run dev              # dev server
npm run build            # production build
npm run start            # serve the production build
npm run lint             # ESLint
npx tsc --noEmit         # type-check (no npm script for this)
npm run generate:clean   # delete lib/generated and .next, then run prisma generate

npx prisma generate      # regenerate the client into lib/generated/prisma
npx prisma migrate dev   # create and apply a migration
npx prisma studio        # inspect the database
```

- There is no test framework, so there is no way to run a test. Verify changes with `npx tsc --noEmit`, `npm run lint`, and the running app.
- `lib/generated/` is gitignored and nothing runs `prisma generate` automatically. Run it after a fresh clone and after every `schema.prisma` change, or imports from `@/lib/generated/prisma/client` fail.
- Prisma CLI config is `prisma7.config.ts`. It connects with `DATABASE_URL_UNPOOLED`, while the app connects with the pooled `DATABASE_URL`.
- `.env` points at a remote Neon database, so Prisma commands run against that database, not a local one. Check what it targets before migrating.
- `npm run lint` currently reports 1 error (`components/ui/carousel.tsx`, `react-hooks/set-state-in-effect`) and 18 warnings. Treat these as the baseline.

## Environment

`TMDB_API_TOKEN`, `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GROQ_API_KEY`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.

`services/llm/groq.ts` throws at import time if `GROQ_API_KEY` is missing, so anything importing the mood actions fails without it.

## Architecture

The code uses vertical feature slices. The `@/*` alias maps to the repo root.

- `app/`: routing only. `(main)` has the header and footer, `(login)` holds the auth pages, `api/` holds route handlers. Pages fetch data and hand it to feature components.
- `features/<name>/`: domain logic. Slices are `auth`, `characters`, `lists`, `media`, `mood-recommendations`, `people`, `profile`, `pwa`, `ratings`, `reviews`, `search`.
- `components/`: `ui/` is shadcn; `media/`, `shared/`, and `layout/` are shared across features.
- `services/`: infrastructure clients with no business logic (`tmdb`, `db`, `llm`, `cloudinary`).
- `lib/`: auth, query client, axios client, generated Prisma client.

Files inside a slice have fixed roles:

| File | Role |
|---|---|
| `queries.ts` | Server-only reads (`import "server-only"`), called from Server Components and actions |
| `actions.ts` | `"use server"` mutations, plus thin `*Action` wrappers that expose reads to the client |
| `schema.ts` | Zod schemas; also filter and URL-param helpers in `media` |
| `types.ts` | Domain types and mappers such as `toMediaCardItem` and `toListSummary` |
| `hooks.ts` / `hook.ts` | Client TanStack Query hooks (`lists` uses `hooks.ts`; `media` and `search` use `hook.ts`) |

### Data flow

- **Server reads:** Server Components call `queries.ts` directly. There is no prefetch and hydrate step.
- **Client reads of TMDB:** hooks call `clientApi` (axios, base `/api`), which goes through `app/api/tmdb/[...path]`. That proxy forwards any GET path and query string to `serverApi` in `services/tmdb/client.ts`. The token never reaches the browser, and `serverApi` is server-only.
- **Client reads of user data:** hooks call server actions such as `getUserListsAction`.
- **Mutations:** components call server actions, often through `useMutation` hooks. The usual action shape is: get the user, `safeParse` the input, check ownership in the Prisma `where`, write, then `revalidatePath`. List mutations must also invalidate React Query keys via `listsKeys`.
- **TMDB caching:** `next: { revalidate }` is set per call in `features/media/queries.ts`: 1h for lists, 12h for details, 24h for genres.
- **Discover pages:** filters live in the URL. `searchParamsToFilters` builds the initial state on the server, and `useSyncedDiscoverFilters` writes changes back with `router.replace`.

Next.js 16 passes `params` and `searchParams` as Promises, so they must be awaited.

### Auth

`lib/auth.ts` configures Better Auth with email and password. `app/api/auth/[...all]` serves it, and `lib/auth-client.ts` is the browser client.

There is no middleware or `proxy.ts`, so nothing protects routes globally. Each page calls `redirect("/login")` itself, and each action or route handler checks `getCurrentUserId()` itself. New protected code must do the same.

The `user.create` database hook creates each user's `WATCHLIST`, `FAVORITE`, and `WATCHED` lists. Code assumes these exist.

### Data model

TMDB is the source of truth for content. The database stores user relationships plus cached display fields.

- `ListItem` caches title, poster, year, `genreIds`, runtime, and vote average. `genreIds` feed the profile charts and the taste profile, and `getMediaMeta` fills these fields when an item is added.
- Favorite, watchlist, and watched state are all `ListItem` rows in the user's typed lists, not separate tables.
- Prisma uses uppercase `MOVIE` / `TV`; TMDB and the UI use lowercase `movie` / `tv`. Convert with `toListMediaType`.
- Batch "is this saved?" checks use `getFavoritedKeys` / `getWatchedKeys` with `toFavoritedKey`. Use them on grids rather than querying per item.

### Mood recommendations

`getMoodRecommendations` in `features/mood-recommendations/actions.ts` is the most involved flow:

1. Chips from `Constants.ts` and free text become a prompt. Groq returns JSON, which `llmMoodOutputSchema` validates. `response_format` is deliberately unused; see the comment in `services/llm/groq.ts`.
2. Genre names and keyword terms resolve to TMDB ids. TV uses `TV_GENRE_NAME_ALIASES` because its genres differ from movie genres.
3. Up to three `/discover` variants run per media type, from tightest to loosest match. Identical variants collapse.
4. Each item scores `TIER_BONUS + position + TASTE_WEIGHT * affinity`. Movies and TV are then merged by score.
5. Items the user already favorited or watched are removed, and the result is capped at `MAX_RESULTS`.

If the LLM path fails, it falls back to chip hints, then to plain TMDB title search. The taste profile comes from `ListItem.genreIds` and needs a minimum signal (`MIN_TASTE_SIGNAL`) before it applies.

### Reviews

Content is Tiptap JSON stored in `Review.content` and rendered on the server by `ReviewContent`. Its extensions (`StarterKit`, `Image`) must stay in step with the editor's, or saved nodes will not render.

Images upload through `app/api/reviews/upload`, which creates an unattached `ReviewImage` row. `saveReview` rejects image URLs the user does not own, attaches the ones in use, and deletes orphans from Cloudinary. Use `toPlainJson` on ProseMirror content before passing it to a server action.

### PWA

The app installs from `app/manifest.ts` with no service worker and no offline cache, on purpose. The inline script in `app/layout.tsx` captures `beforeinstallprompt` before hydration, and `InstallPrompt` shows its banner once per browser (`localStorage`). Safari and Firefox on Android have no such event, so the banner shows manual steps instead.

## Things that will trip you up

- **Action result shapes differ.** `lists`, `characters`, and `profile` return `{ success, ... }`; `ratings` and `reviews` return `{ ok, ... }`. Check the slice before handling a result.
- **Auth failures differ too.** `lists` throws from `requireUserId()`; `ratings` and `reviews` return an error result.
- **`features/media/hook.ts` is singular**, unlike `features/lists/hooks.ts`.
- **Some `revalidatePath` targets don't match real routes.** `features/ratings/actions.ts` and `features/characters/actions.ts` use `/movies/:id`, but the detail route is `/movie/[id]`. `features/lists/actions.ts` uses `/watchlist`, `/favorites`, and `/watched`, but the routes live under `/profile/`. Use the real route in new code.
- **`README.md` is out of date.** It says Next.js 15, omits the Groq and Cloudinary variables, and mentions `AGENT.md`, `.env.example`, and `LICENSE`, none of which exist.
- **The app is dark-only:** `app/layout.tsx` hardcodes the `dark` class.
- **New image hosts** must be added to `images.remotePatterns` in `next.config.ts`. TMDB and Cloudinary are already allowed.
