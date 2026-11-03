# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

Moodflix is a movie and TV discovery and tracking app. Users browse TMDB content, keep lists, rate titles, write reviews, and get mood-based recommendations from an LLM.

Stack: Next.js 16.4 (App Router, Cache Components, Partial Prefetching), React 19, TypeScript, Tailwind 4 with shadcn/ui, TanStack Query, Prisma 7 on Neon Postgres, Better Auth, Zod 4, Tiptap, Cloudinary, Groq.

## Commands

```bash
npm run dev              # dev server
npm run build            # production build
npm run start            # serve the production build
npm run lint             # ESLint
npm run typecheck        # next typegen, then tsc --noEmit
npm run generate:clean   # delete lib/generated and .next, then run prisma generate

npx prisma generate      # regenerate the client into lib/generated/prisma
npx prisma migrate dev   # create and apply a migration
npx prisma studio        # inspect the database
```

- There is no test framework, so there is no way to run a test. Verify changes with `npm run typecheck`, `npm run lint`, `npm run build`, and the running app. `PageProps`, `LayoutProps`, `RouteContext` and the custom `cacheLife` profile names are generated types; a bare `tsc` fails until `next typegen` (or `dev`/`build`) has run.
- `lib/generated/` is gitignored and nothing runs `prisma generate` automatically. Run it after a fresh clone and after every `schema.prisma` change, or imports from `@/lib/generated/prisma/client` fail.
- Prisma CLI config is `prisma7.config.ts`. It connects with `DATABASE_URL_UNPOOLED`, while the app connects with the pooled `DATABASE_URL`.
- `.env` points at a remote Neon database, so Prisma commands run against that database, not a local one. Check what it targets before migrating.
- `npm run lint` currently reports 1 error (`components/ui/carousel.tsx`, `react-hooks/set-state-in-effect`) and 13 warnings. Treat these as the baseline.
- `npm run build` prerenders TMDB data, so it needs network access to TMDB (it fails with `fetch failed` otherwise). The build itself does not query the database: everything per-user goes through `getCurrentUserId()`, which calls `connection()`.

## Environment

`TMDB_API_TOKEN`, `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GROQ_API_KEY`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.

Optional: `TMDB_API_BASE_URL` overrides `https://api.themoviedb.org/3` (for a proxy where TMDB is blocked, or a local mock).

`services/llm/groq.ts` throws at import time if `GROQ_API_KEY` is missing, so anything importing the mood actions fails without it.

## Architecture

The code uses vertical feature slices. The `@/*` alias maps to the repo root.

- `app/`: routing only. `(main)` has the header and footer, `(login)` holds the auth pages, `api/` holds route handlers. Pages fetch data and hand it to feature components.
- `features/<name>/`: domain logic. Slices are `auth`, `characters`, `home`, `lists`, `media`, `mood-recommendations`, `people`, `profile`, `pwa`, `ratings`, `reviews`, `search`.
- `components/`: `ui/` is shadcn; `media/`, `shared/`, and `layout/` are shared across features.
- `services/`: infrastructure clients with no business logic (`tmdb`, `db`, `llm`, `cloudinary`). `services/tmdb` exports `tmdb` (typed raw endpoints), built on `tmdbFetch` in `client.ts`, the only code that calls TMDB.
- `lib/`: auth, query client, `api/` (browser `getJson` helper, server `publicJson` response helper), formatting and image helpers, generated Prisma client.

File names are kebab-case everywhere.

Files inside a slice have fixed roles:

| File | Role |
|---|---|
| `queries.ts` | Server-only reads (`import "server-only"`), called from Server Components and actions |
| `actions.ts` | `"use server"` mutations, plus thin `*Action` wrappers that expose reads to the client |
| `schema.ts` | Zod schemas; also filter and URL-param helpers in `media` |
| `types.ts` | Domain types and mappers such as `toMediaCardItem` and `toListSummary` |
| `hooks.ts` | Client TanStack Query hooks |
| `keys.ts` | Plain (non-client) helpers and React Query keys that server components also need, e.g. `listsKeys` |

### Data flow

- **Server reads:** Server Components call `queries.ts` directly.
- **TMDB reads are cached twice.** Every TMDB query in `features/*/queries.ts` is a `"use cache"` function with `cacheLife("tmdb-list" | "tmdb-detail" | "tmdb-static")` and a `cacheTag`; it maps the response before caching, so entries stay small. Underneath, `tmdbFetch` uses `cache: "force-cache"` with a matching `revalidate`, so the raw response also sits in the persistent fetch Data Cache, which survives restarts and serverless instances. The profiles are defined in `next.config.ts` and mirrored by `TMDB_REVALIDATE` in `services/tmdb/cache.ts`; change both together.
- **One details request per title.** `tmdb.movie.details` / `tmdb.tv.details` always use the same `append_to_response`, so the detail page, `getMediaCast` and `getMediaMeta` share one cached response. Keep it that way rather than adding a separate `/movie/:id/...` call.
- **Client reads of TMDB** go through three typed route handlers, never TMDB directly: `/api/tmdb/search?query=`, `/api/tmdb/discover/[type]?<filter params>&page=`, and `/api/tmdb/[type]/[id]/cast`. They validate input, call the cached queries, and set `Cache-Control` via `publicJson`. There is no generic proxy; add a typed route for any new client need.
- **Client reads of user data:** hooks call server actions such as `getUserListsAction`.
- **Mutations:** components call server actions, often through `useMutation` hooks. The usual action shape is: get the user, `safeParse` the input, check ownership in the Prisma `where`, write, then `refresh()`. List mutations must also update React Query keys via `listsKeys`.
- **Discover pages:** filters live in the URL. `DiscoverPage` reads `searchParams` inside Suspense, renders page 1 on the server (cached per filter combination), and passes it to `useDiscover` as initial data. `useSyncedDiscoverFilters` writes changes back with `history.replaceState`, which updates the URL without a server round trip.

Next.js 16 passes `params` and `searchParams` as Promises, so they must be awaited inside a Suspense boundary (or a segment with `loading.tsx`).

### Caching and rendering (Cache Components)

`cacheComponents` and `partialPrefetching` are on. Each route prerenders a static shell, and only the parts that read the request stream in.

- **TMDB pages carry no per-user data.** Home, `/movies`, `/shows`, `/genres`, detail, season and person pages render only cached TMDB data, so they are shared by every visitor. Detail pages prerender this week's trending titles via `generateStaticParams`; other ids render once and are then cached.
- **Saved state lives in the viewer library**, not in page props. `<ViewerLibrarySeed />` (inside Suspense in `app/(main)/layout.tsx`) streams the user's favorite/watched/watchlist keys into React Query under `listsKeys.library`. `QuickListButton` reads it with `useIsInLibrary` and `useToggleQuickList` updates it optimistically. Never pass `initialFavorited`-style props or query saved keys per page; that would make the page per-user again. The Header clears the library on logout.
- **Per-user or per-vote parts are small Suspense islands:** the Moodflix rating, the user's favorite characters in the cast, and the rate/reviews section in `MediaDetailView`; latest reviews on home. Signed-in segments (`/profile`, `/lists`, `/reviews`) use `loading.tsx`.
- **`revalidatePath` discards every cached entry read on that route, including TMDB data.** Pages whose data is per-request already show fresh data, so actions call `refresh()` to re-render the open page instead. Only use `revalidatePath` / `updateTag` for data that is actually cached.
- `"use cache"` functions cannot call `cookies()`, `headers()` or `getCurrentUserId()`. Read the user outside and pass the id in as an argument.
- Pages export `instant = true` so dev mode flags anything that would block a client navigation.

### Auth

`lib/auth.ts` configures Better Auth with email and password. `app/api/auth/[...all]` serves it, and `lib/auth-client.ts` is the browser client.

There is no middleware or `proxy.ts`, so nothing protects routes globally. Each page calls `redirect("/login")` itself, and each action or route handler checks `getCurrentUserId()` itself. New protected code must do the same. Read the session through `getCurrentUserId()`, not `auth.api.getSession` directly: it calls `connection()` first, which keeps the database lookup out of prerenders and per-session prefetches.

The `user.create` database hook creates each user's `WATCHLIST`, `FAVORITE`, and `WATCHED` lists. Code assumes these exist.

### Data model

TMDB is the source of truth for content. The database stores user relationships plus cached display fields.

- `ListItem` caches title, poster, year, `genreIds`, runtime, and vote average. `genreIds` feed the profile charts and the taste profile, and `getMediaMeta` fills these fields when an item is added.
- Favorite, watchlist, and watched state are all `ListItem` rows in the user's typed lists, not separate tables.
- Prisma uses uppercase `MOVIE` / `TV`; TMDB and the UI use lowercase `movie` / `tv`. Convert with `toListMediaType`.
- Saved state on cards comes from the viewer library (see Caching below). Keys are `toFavoritedKey` strings from `features/lists/types.ts` (`MOVIE-123`). Server-side batch checks (`getFavoritedKeys` / `getWatchedKeys`) are only for the mood flow's filtering.

### Mood recommendations

`getMoodRecommendations` in `features/mood-recommendations/actions.ts` is the most involved flow:

1. Chips from `constants.ts` and free text become a prompt. Groq returns JSON, which `llmMoodOutputSchema` validates. `response_format` is deliberately unused; see the comment in `services/llm/groq.ts`.
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
- **Routes are singular:** the detail routes are `/movie/[id]` and `/tv/[id]`; `/movies` and `/shows` are the discover pages.
- **Non-deterministic values** (`new Date()`, `Math.random()`) in a Server Component need `"use cache"` or `connection()`, or the build fails. See `components/layout/footer.tsx`.
- **`README.md` is out of date.** It says Next.js 15, describes the removed `[...path]` TMDB proxy, omits the Groq and Cloudinary variables, and mentions `AGENT.md`, `.env.example`, and `LICENSE`, none of which exist.
- **The app is dark-only:** `app/layout.tsx` hardcodes the `dark` class.
- **New image hosts** must be added to `images.remotePatterns` in `next.config.ts`. TMDB and Cloudinary are already allowed.
