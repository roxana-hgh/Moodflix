/**
 * Cache settings for TMDB data.
 *
 * Two layers sit in front of every TMDB request:
 * 1. `'use cache'` + `cacheLife()` in the feature queries (in-memory, holds the mapped result).
 * 2. The fetch Data Cache in `tmdbFetch` (persistent, survives restarts and serverless instances).
 *
 * The seconds below match the `cacheLife` profiles in next.config.ts.
 */
export const TMDB_REVALIDATE = {
  list: 60 * 60, // "tmdb-list"
  detail: 60 * 60 * 12, // "tmdb-detail"
  static: 60 * 60 * 24 * 7, // "tmdb-static"
} as const;

export type TmdbRevalidate = keyof typeof TMDB_REVALIDATE;

/** Every TMDB cache entry carries this tag, so `revalidateTag(TMDB_TAG)` flushes them all. */
export const TMDB_TAG = "tmdb";
