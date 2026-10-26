import "server-only";
import { getMovieGenres, getTVGenres } from "@/features/media/queries";
import { getGenreStats } from "@/features/lists/queries";
import { withGenreNames } from "@/features/lists/types";
import type { LlmMoodOutput } from "@/features/mood-recommendations/schema";
import type { TMDBPaginatedResponse, TMDBKeyword } from "@/services/tmdb/types";
import { serverApi } from "@/services/tmdb/client";


// TMDB's TV genre list merges/renames a few movie genres.
// No entry here = matched by exact name, or has no TV equivalent (dropped).
const TV_GENRE_NAME_ALIASES: Partial<Record<LlmMoodOutput["genres"][number], string>> = {
  Action: "Action & Adventure",
  Adventure: "Action & Adventure",
  Fantasy: "Sci-Fi & Fantasy",
  "Science Fiction": "Sci-Fi & Fantasy",
  War: "War & Politics",
};

export async function resolveGenreIds(
  genres: LlmMoodOutput["genres"],
  mediaType: LlmMoodOutput["mediaType"]
): Promise<{ movieGenreIds: number[]; tvGenreIds: number[] }> {
  if (genres.length === 0) {
    return { movieGenreIds: [], tvGenreIds: [] };
  }

  const needsMovie = mediaType === "movie" || mediaType === "both";
  const needsTv = mediaType === "tv" || mediaType === "both";

  const [movieGenres, tvGenres] = await Promise.all([
    needsMovie ? getMovieGenres() : Promise.resolve([]),
    needsTv ? getTVGenres() : Promise.resolve([]),
  ]);

  const movieGenreIds = movieGenres
    .filter((g) => genres.includes(g.name as LlmMoodOutput["genres"][number]))
    .map((g) => g.id);

  const tvGenreIds = tvGenres
    .filter((g) =>
      genres.some((name) => (TV_GENRE_NAME_ALIASES[name] ?? name) === g.name)
    )
    .map((g) => g.id);

  return { movieGenreIds, tvGenreIds };
}


export async function resolveKeywordIds(keywordTerms: string[]): Promise<number[]> {
  if (keywordTerms.length === 0) {
    return [];
  }

  const results = await Promise.all(
    keywordTerms.map(async (term) => {
      const data = await serverApi<TMDBPaginatedResponse<TMDBKeyword>>("/search/keyword", {
        params: { query: term },
        // a term like "forest" always resolves to the same keyword id — safe to cache
        next: { revalidate: 60 * 60 * 24 },
      });

      return data.results[0]?.id;
    })
  );

  // drop terms with no match, dedupe in case two terms resolve to the same id
  return [...new Set(results.filter((id): id is number => id !== undefined))];
}


// ───────────────────────── Taste profile ─────────────────────────

const FAVORITE_WEIGHT = 2; // a favorite says more about taste than a watched title
const MIN_TASTE_SIGNAL = 10; // weighted genre tags needed before we personalize at all
const TOP_GENRES = 4;

export interface TasteProfile {
  /** Display names, strongest first — used in the prompt and the UI indicator. */
  topGenres: string[];
  /**
   * genreId → 0..1 (1 = strongest genre). Keyed by id only: shared genres (Drama, Comedy, Crime…)
   * have the same id for movies and TV, so taste carries across both.
   */
  genreWeights: Map<number, number>;
}

/** Built purely from the DB (ListItem.genreIds) — no TMDB calls except the cached genre lists. */
export async function getTasteProfile(userId: string): Promise<TasteProfile | null> {
  const [favorites, watched, movieGenres, tvGenres] = await Promise.all([
    getGenreStats(userId, "FAVORITE"),
    getGenreStats(userId, "WATCHED"),
    getMovieGenres(),
    getTVGenres(),
  ]);

  const weighted = [
    ...favorites.map((s) => ({ ...s, count: s.count * FAVORITE_WEIGHT })),
    ...watched,
  ];

  const signal = weighted.reduce((sum, s) => sum + s.count, 0);
  if (signal < MIN_TASTE_SIGNAL) return null;

  const countById = new Map<number, number>();
  for (const { genreId, count } of weighted) {
    countById.set(genreId, (countById.get(genreId) ?? 0) + count);
  }
  const max = Math.max(...countById.values());
  const genreWeights = new Map([...countById].map(([id, count]) => [id, count / max] as const));

  const topGenres = withGenreNames(weighted, movieGenres, tvGenres)
    .slice(0, TOP_GENRES)
    .map((g) => g.name);

  return { topGenres, genreWeights };
}