import "server-only";
import { getMovieGenres, getTVGenres } from "@/features/media/queries";
import { LlmMoodOutput } from "@/features/mood-recommendations/schema";
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