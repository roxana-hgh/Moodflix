"use server";

import { getMoodCompletion } from "@/services/llm/groq";
import {
  moodInputSchema,
  llmMoodOutputSchema,
  type LlmMoodOutput,
} from "./schema";
import { resolveGenreIds, resolveKeywordIds } from "./queries";
import { serverApi } from "@/services/tmdb/client";
import { toMediaCardItem } from "@/features/media/types";
import { getCurrentUserId } from "@/lib/auth";
import { getFavoritedKeys, getWatchedKeys } from "@/features/lists/queries";
import type { MediaCardItem } from "@/types/media";
import type {
  TMDBPaginatedResponse,
  TMDBMovieResult,
  TMDBTVResult,
} from "@/services/tmdb/types";
import { toFavoritedKey, toListMediaType } from "@/features/lists/types";

function extractJson(raw: string): string {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return (fenced ? fenced[1] : raw).trim();
}

const MOOD_SYSTEM_PROMPT = `Convert the user's natural language mood into structured search terms.
Output schema: { "genres": string[], "keywordTerms": string[], "avoidTerms": string[], "mediaType": "movie" | "tv" | "both", "sortBy": "popularity" | "rating" }
Allowed genres (use exact names): Action, Adventure, Animation, Comedy, Crime, Documentary, Drama, Family, Fantasy, History, Horror, Music, Mystery, Romance, Science Fiction, TV Movie, Thriller, War, Western
Rules:
- keywordTerms should be concrete and searchable (e.g. "forest", "small town", "heist", "wedding"), not abstract feelings.
- If the mood implies a positive/happy tone, add relevant avoidTerms (e.g. "tragedy", "war") rather than inventing a "happy ending" keyword.
- If mediaType isn't specified or implied, default to "both".
- Never invent genres outside the allowed list.
- Keep keywordTerms literal — they will be searched against a keyword database, not interpreted.
Respond with JSON only, no preamble.`;

const SORT_MAP = {
  popularity: "popularity.desc",
  rating: "vote_average.desc",
} as const;

async function fallbackTextSearch(rawMood: string): Promise<MediaCardItem[]> {
  const [movies, tv] = await Promise.all([
    serverApi<TMDBPaginatedResponse<TMDBMovieResult>>("/search/movie", {
      params: { query: rawMood },
    }),
    serverApi<TMDBPaginatedResponse<TMDBTVResult>>("/search/tv", {
      params: { query: rawMood },
    }),
  ]);

  return [
    ...movies.results.map((m) =>
      toMediaCardItem({ ...m, media_type: "movie" }),
    ),
    ...tv.results.map((t) => toMediaCardItem({ ...t, media_type: "tv" })),
  ];
}

const MIN_VOTE_COUNT = 50;

function weightedRating(
  voteAverage: number,
  voteCount: number,
  poolMean: number,
  m = MIN_VOTE_COUNT,
): number {
  return (
    (voteCount / (voteCount + m)) * voteAverage +
    (m / (voteCount + m)) * poolMean
  );
}

function rankByWeightedRating<
  T extends { vote_average: number; vote_count: number },
>(items: T[]): T[] {
  if (items.length === 0) return items;

  const poolMean =
    items.reduce((sum, i) => sum + i.vote_average, 0) / items.length;

  return [...items].sort(
    (a, b) =>
      weightedRating(b.vote_average, b.vote_count, poolMean) -
      weightedRating(a.vote_average, a.vote_count, poolMean),
  );
}

async function discoverFromMood(
  parsed: LlmMoodOutput,
): Promise<MediaCardItem[]> {
  const { movieGenreIds, tvGenreIds } = await resolveGenreIds(
    parsed.genres,
    parsed.mediaType,
  );
  const keywordIds = await resolveKeywordIds(parsed.keywordTerms);
  console.log(
    "[mood] resolved movieGenreIds:",
    movieGenreIds,
    "tvGenreIds:",
    tvGenreIds,
    "keywordIds:",
    keywordIds,
  );

  const sort_by = SORT_MAP[parsed.sortBy];
  const wantMovies =
    parsed.mediaType === "movie" || parsed.mediaType === "both";
  const wantTv = parsed.mediaType === "tv" || parsed.mediaType === "both";

  const [movieResults, tvResults] = await Promise.all([
    wantMovies
      ? serverApi<TMDBPaginatedResponse<TMDBMovieResult>>("/discover/movie", {
          params: {
            with_genres: movieGenreIds.join(",") || undefined, // AND — genres co-occurring is normal
            with_keywords: keywordIds.join("|") || undefined, // OR — any one keyword match is enough
            sort_by,
            "vote_count.gte": 50,
            include_adult: false,
          },
        }).then((d) => d.results)
      : Promise.resolve<TMDBMovieResult[]>([]),
    wantTv
      ? serverApi<TMDBPaginatedResponse<TMDBTVResult>>("/discover/tv", {
          params: {
            with_genres: tvGenreIds.join(",") || undefined,
            with_keywords: keywordIds.join("|") || undefined,
            sort_by,
            "vote_count.gte": 50,
            include_adult: false,
          },
        }).then((d) => d.results)
      : Promise.resolve<TMDBTVResult[]>([]),
  ]);

  console.log(
    "[mood] movie results:",
    movieResults.length,
    "tv results:",
    tvResults.length,
  );

  const rankedMovies =
    parsed.sortBy === "rating"
      ? rankByWeightedRating(movieResults)
      : movieResults;
  const rankedTv =
    parsed.sortBy === "rating" ? rankByWeightedRating(tvResults) : tvResults;

  return [
    ...rankedMovies.map((m) => toMediaCardItem({ ...m, media_type: "movie" })),
    ...rankedTv.map((t) => toMediaCardItem({ ...t, media_type: "tv" })),
  ];
}

async function filterAlreadySaved(
  userId: string,
  results: MediaCardItem[],
): Promise<MediaCardItem[]> {
  const candidateItems = results.map((item) => ({
    tmdbId: item.id,
    mediaType: toListMediaType(item.mediaType),
  }));

  const [favoritedKeys, watchedKeys] = await Promise.all([
    getFavoritedKeys(userId, candidateItems),
    getWatchedKeys(userId, candidateItems),
  ]);

  return results.filter((item) => {
    const key = toFavoritedKey(item.id, toListMediaType(item.mediaType));
    return !favoritedKeys.has(key) && !watchedKeys.has(key);
  });
}

export async function getMoodRecommendations(rawInput: unknown): Promise<{
  results: MediaCardItem[];
  usedFallback: boolean;
  interpreted: { genres: string[]; keywordTerms: string[] } | null;
}> {
  const { mood } = moodInputSchema.parse(rawInput);

  let results: MediaCardItem[];
  let usedFallback = false;
  let interpreted: { genres: string[]; keywordTerms: string[] } | null = null;

  try {
    const raw = await getMoodCompletion(MOOD_SYSTEM_PROMPT, `Mood: "${mood}"`);
    console.log("[mood] raw LLM response:", raw);

    const parsed = llmMoodOutputSchema.parse(JSON.parse(extractJson(raw)));
    console.log("[mood] parsed LLM output:", parsed);

    interpreted = { genres: parsed.genres, keywordTerms: parsed.keywordTerms };
    results = await discoverFromMood(parsed);
    console.log("[mood] discover result count:", results.length);
  } catch (err) {
    console.error(
      "[mood] LLM/discover path failed, falling back to text search:",
      err,
    );
    usedFallback = true;
    try {
      results = await fallbackTextSearch(mood);
      console.log("[mood] fallback result count:", results.length);
    } catch (fallbackErr) {
      console.error("[mood] fallback text search ALSO failed:", fallbackErr);
      results = [];
    }
  }

  const userId = await getCurrentUserId();
  if (userId) {
    const beforeCount = results.length;
    results = await filterAlreadySaved(userId, results);
    console.log(
      `[mood] filtered saved items: ${beforeCount} -> ${results.length}`,
    );
  }

  return { results, usedFallback, interpreted };
}
