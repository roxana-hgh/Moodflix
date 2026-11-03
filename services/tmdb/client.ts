import "server-only";
import { TMDB_REVALIDATE, TMDB_TAG, type TmdbRevalidate } from "./cache";

// Overridable for a proxy (where TMDB is blocked) or a local mock.
const TMDB_BASE_URL = process.env.TMDB_API_BASE_URL ?? "https://api.themoviedb.org/3";

export type TmdbParams = Record<string, string | number | boolean | undefined>;

export class TmdbError extends Error {
  constructor(
    readonly endpoint: string,
    readonly status: number,
    body: string,
  ) {
    super(`TMDB GET ${endpoint} failed (${status}): ${body}`);
    this.name = "TmdbError";
  }
}

export function isTmdbNotFound(err: unknown): boolean {
  return err instanceof TmdbError && err.status === 404;
}

// Sorted keys give one URL (and so one cache entry) for the same params in any order.
function buildUrl(endpoint: string, params?: TmdbParams) {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  if (params) {
    for (const key of Object.keys(params).sort()) {
      const value = params[key];
      if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

interface TmdbFetchOptions {
  params?: TmdbParams;
  /** How long the response stays in the persistent fetch cache. */
  revalidate: TmdbRevalidate;
}

/**
 * The only place that talks to TMDB. Server-only, so the token never reaches the browser.
 * Every response goes through the fetch Data Cache, which persists across requests,
 * restarts and instances.
 */
export async function tmdbFetch<T>(endpoint: string, { params, revalidate }: TmdbFetchOptions): Promise<T> {
  const token = process.env.TMDB_API_TOKEN;
  if (!token) throw new Error("TMDB_API_TOKEN is not set");

  const res = await fetch(buildUrl(endpoint, params), {
    headers: { Authorization: `Bearer ${token}`, accept: "application/json" },
    cache: "force-cache",
    next: { revalidate: TMDB_REVALIDATE[revalidate], tags: [TMDB_TAG] },
  });

  if (!res.ok) {
    throw new TmdbError(endpoint, res.status, await res.text());
  }

  return res.json() as Promise<T>;
}
