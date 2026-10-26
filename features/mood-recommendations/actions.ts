"use server";

import { getMoodCompletion } from "@/services/llm/groq";
import {
  moodInputSchema,
  llmMoodOutputSchema,
  type LlmMoodOutput,
  type MoodInput,
} from "./schema";
import {
  resolveGenreIds,
  resolveKeywordIds,
  getTasteProfile,
  type TasteProfile,
} from "./queries";
import { MOOD_GROUPS, resolveMoodOptions, type MoodOption } from "./Constants";
import { serverApi } from "@/services/tmdb/client";
import { toMediaCardItem } from "@/features/media/types";
import { getCurrentUserId } from "@/lib/auth";
import {
  getFavoritedKeys,
  getWatchedKeys,
  toFavoritedKey,
} from "@/features/lists/queries";
import type { MediaCardItem } from "@/types/media";
import type {
  TMDBPaginatedResponse,
  TMDBMovieResult,
  TMDBTVResult,
} from "@/services/tmdb/types";
import { toListMediaType } from "@/features/lists/types";

type Interpreted = { genres: string[]; keywordTerms: string[] };

function extractJson(raw: string): string {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return (fenced ? fenced[1] : raw).trim();
}

// ───────────────────────── Prompt ─────────────────────────

const MOOD_SYSTEM_PROMPT = `Convert the viewer's request into structured search terms.
The request is a few labelled lines: picked chips grouped as Mood / Occasion / Vibe, optional free text, a requested type, and optionally the viewer's favorite genres.
Output schema: { "genres": string[], "keywordTerms": string[], "avoidTerms": string[], "mediaType": "movie" | "tv" | "both", "sortBy": "popularity" | "rating" }
Allowed genres (use exact names): Action, Adventure, Animation, Comedy, Crime, Documentary, Drama, Family, Fantasy, History, Horror, Music, Mystery, Romance, Science Fiction, TV Movie, Thriller, War, Western
Rules:
- Combine ALL picked chips and the free text into ONE coherent result. If the free text conflicts with a chip, the free text wins.
- Return at most 3 genres: the ones that best fit the whole combination, most important first.
- keywordTerms should be concrete and searchable (e.g. "forest", "small town", "heist", "wedding"), not abstract feelings.
- If the combination implies a positive/happy tone, add relevant avoidTerms (e.g. "tragedy", "war") rather than inventing a "happy ending" keyword.
- mediaType: if "Requested type" is movie or tv, use it exactly. If it is "both", infer from the request only when clearly implied (e.g. "binge", "series" -> tv), otherwise "both".
- sortBy: use "rating" for Hidden gems, Prestige drama, or when quality is asked for; otherwise "popularity".
- The viewer's favorite genres are a soft tie-breaker only: use them to choose between genres that fit the request equally well. Never add a genre that doesn't fit the request, and never let them override the picked chips.
- Never invent genres outside the allowed list.
- Keep keywordTerms literal — they will be searched against a keyword database, not interpreted.
Respond with JSON only, no preamble.`;

function buildUserMessage(
  input: MoodInput,
  selected: MoodOption[],
  taste: TasteProfile | null,
): string {
  const lines: string[] = [];

  for (const group of MOOD_GROUPS) {
    const labels = selected.filter((o) => o.group === group.id).map((o) => o.label);
    if (labels.length > 0) lines.push(`${group.label}: ${labels.join(", ")}`);
  }
  if (input.text) lines.push(`Free text: ${JSON.stringify(input.text)}`);
  lines.push(`Requested type: ${input.mediaType}`);
  if (taste) {
    lines.push(`Viewer's favorite genres (soft tie-breaker only): ${taste.topGenres.join(", ")}`);
  }

  return lines.join("\n");
}

// ───────────────────────── Fallbacks ─────────────────────────

const unique = <T,>(values: T[]): T[] => [...new Set(values)];

/** Builds search params straight from the chips' hints — used when the LLM path fails. */
function buildHintedMood(
  selected: MoodOption[],
  mediaType: MoodInput["mediaType"],
): LlmMoodOutput | null {
  if (selected.length === 0) return null;

  return llmMoodOutputSchema.parse({
    genres: unique(selected.flatMap((o) => o.genres)),
    keywordTerms: unique(selected.flatMap((o) => o.keywords)),
    avoidTerms: unique(selected.flatMap((o) => o.avoid)),
    mediaType:
      mediaType !== "both"
        ? mediaType
        : (selected.find((o) => o.mediaType)?.mediaType ?? "both"),
    sortBy: selected.some((o) => o.sortBy === "rating") ? "rating" : "popularity",
  });
}

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

// ───────────────────────── Ranking ─────────────────────────

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

// Tunables. Final score = tier bonus + position in its list (0..1) + TASTE_WEIGHT * affinity (0..1).
const TIER_BONUS = [0.6, 0.3, 0] as const; // tightest match → loosest
const TASTE_WEIGHT = 0.4;
const MAX_RESULTS = 40;

interface Scorable {
  id: number;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
}

interface DiscoverVariant {
  genres?: string;
  keywords?: string;
  bonus: number;
}

interface Pool<T> {
  items: T[];
  bonus: number;
}

/**
 * From tightest to loosest:
 *  1. every genre (AND) + any keyword (OR)
 *  2. any genre (OR)    + any keyword (OR)
 *  3. any genre (OR), no keywords
 * Identical variants (e.g. a single genre, or no keywords) collapse into the highest-bonus one.
 */
function buildVariants(genreIds: number[], keywordIds: number[]): DiscoverVariant[] {
  const keywords = keywordIds.join("|") || undefined;
  const candidates: DiscoverVariant[] = [
    { genres: genreIds.join(",") || undefined, keywords, bonus: TIER_BONUS[0] },
    { genres: genreIds.join("|") || undefined, keywords, bonus: TIER_BONUS[1] },
    { genres: genreIds.join("|") || undefined, keywords: undefined, bonus: TIER_BONUS[2] },
  ];

  const seen = new Set<string>();
  return candidates.filter((v) => {
    const key = `${v.genres}/${v.keywords}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function discoverPools<T extends Scorable>(
  path: "/discover/movie" | "/discover/tv",
  args: {
    genreIds: number[];
    keywordIds: number[];
    withoutKeywordIds: number[];
    sortBy: string;
  },
): Promise<Pool<T>[]> {
  const variants = buildVariants(args.genreIds, args.keywordIds);

  // Promise.all keeps variant order, so earlier (tighter) pools win when we dedupe.
  return Promise.all(
    variants.map(async (variant) => {
      const data = await serverApi<TMDBPaginatedResponse<T>>(path, {
        params: {
          with_genres: variant.genres,
          with_keywords: variant.keywords,
          without_keywords: args.withoutKeywordIds.join("|") || undefined, // exclude if ANY avoid-term matches
          sort_by: args.sortBy,
          "vote_count.gte": MIN_VOTE_COUNT,
          include_adult: false,
        },
      });
      return { items: data.results, bonus: variant.bonus };
    }),
  );
}

/** 0..1 — average taste weight of the item's genres. */
function affinity(genreIds: number[], taste: TasteProfile | null): number {
  if (!taste || genreIds.length === 0) return 0;
  let sum = 0;
  for (const id of genreIds) sum += taste.genreWeights.get(id) ?? 0;
  return sum / genreIds.length;
}

function scorePools<T extends Scorable>(
  pools: Pool<T>[],
  sortBy: LlmMoodOutput["sortBy"],
  taste: TasteProfile | null,
): { item: T; score: number }[] {
  const seen = new Set<number>();
  const scored: { item: T; score: number }[] = [];

  for (const { items, bonus } of pools) {
    const ordered = sortBy === "rating" ? rankByWeightedRating(items) : items;

    ordered.forEach((item, index) => {
      if (seen.has(item.id)) return;
      seen.add(item.id);

      const position = 1 - index / ordered.length;
      scored.push({
        item,
        score: bonus + position + TASTE_WEIGHT * affinity(item.genre_ids, taste),
      });
    });
  }

  return scored;
}

/**
 * A media type with requested genres it simply doesn't have (e.g. Romance on TMDB's TV list)
 * and nothing else to narrow by would return generic popular titles — skip it instead.
 */
function shouldQuery(
  requestedGenreCount: number,
  genreIds: number[],
  keywordIds: number[],
): boolean {
  return !(requestedGenreCount > 0 && genreIds.length === 0 && keywordIds.length === 0);
}

async function discoverFromMood(
  parsed: LlmMoodOutput,
  taste: TasteProfile | null,
): Promise<MediaCardItem[]> {
  const { movieGenreIds, tvGenreIds } = await resolveGenreIds(
    parsed.genres,
    parsed.mediaType,
  );
  const [keywordIds, avoidIds] = await Promise.all([
    resolveKeywordIds(parsed.keywordTerms),
    resolveKeywordIds(parsed.avoidTerms),
  ]);
  const withoutKeywordIds = avoidIds.filter((id) => !keywordIds.includes(id));

  console.log(
    "[mood] movieGenreIds:",
    movieGenreIds,
    "tvGenreIds:",
    tvGenreIds,
    "keywordIds:",
    keywordIds,
    "withoutKeywordIds:",
    withoutKeywordIds,
    "taste:",
    taste?.topGenres ?? null,
  );

  const sort_by = SORT_MAP[parsed.sortBy];
  const wantMovies =
    (parsed.mediaType === "movie" || parsed.mediaType === "both") &&
    shouldQuery(parsed.genres.length, movieGenreIds, keywordIds);
  const wantTv =
    (parsed.mediaType === "tv" || parsed.mediaType === "both") &&
    shouldQuery(parsed.genres.length, tvGenreIds, keywordIds);

  const [moviePools, tvPools] = await Promise.all([
    wantMovies
      ? discoverPools<TMDBMovieResult>("/discover/movie", {
          genreIds: movieGenreIds,
          keywordIds,
          withoutKeywordIds,
          sortBy: sort_by,
        })
      : Promise.resolve<Pool<TMDBMovieResult>[]>([]),
    wantTv
      ? discoverPools<TMDBTVResult>("/discover/tv", {
          genreIds: tvGenreIds,
          keywordIds,
          withoutKeywordIds,
          sortBy: sort_by,
        })
      : Promise.resolve<Pool<TMDBTVResult>[]>([]),
  ]);

  const movies = scorePools(moviePools, parsed.sortBy, taste).map(
    ({ item, score }) => ({
      score,
      card: toMediaCardItem({ ...item, media_type: "movie" }),
    }),
  );
  const shows = scorePools(tvPools, parsed.sortBy, taste).map(
    ({ item, score }) => ({
      score,
      card: toMediaCardItem({ ...item, media_type: "tv" }),
    }),
  );

  console.log("[mood] movie candidates:", movies.length, "tv candidates:", shows.length);

  // Movies and TV are scored on the same scale, so they interleave by relevance.
  return [...movies, ...shows]
    .sort((a, b) => b.score - a.score)
    .map(({ card }) => card);
}

const SORT_MAP = {
  popularity: "popularity.desc",
  rating: "vote_average.desc",
} as const;

// ───────────────────────── Saved-item filter ─────────────────────────

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

// ───────────────────────── Action ─────────────────────────

async function fallbackDiscover(
  input: MoodInput,
  selected: MoodOption[],
  taste: TasteProfile | null,
): Promise<{ results: MediaCardItem[]; interpreted: Interpreted | null }> {
  // 1) chips still carry meaning even without the LLM
  const hinted = buildHintedMood(selected, input.mediaType);
  if (hinted) {
    try {
      const results = await discoverFromMood(hinted, taste);
      return {
        results,
        interpreted: { genres: hinted.genres, keywordTerms: hinted.keywordTerms },
      };
    } catch (err) {
      console.error("[mood] chip-hint discover failed:", err);
    }
  }

  // 2) last resort: plain title search on the free text
  if (input.text) {
    try {
      return { results: await fallbackTextSearch(input.text), interpreted: null };
    } catch (err) {
      console.error("[mood] fallback text search ALSO failed:", err);
    }
  }

  return { results: [], interpreted: null };
}

export async function getMoodRecommendations(rawInput: unknown): Promise<{
  results: MediaCardItem[];
  usedFallback: boolean;
  interpreted: Interpreted | null;
  /** Present whenever the viewer has enough history to personalize (even if they switched it off). */
  taste: { genres: string[] } | null;
}> {
  const input = moodInputSchema.parse(rawInput);
  const selected = resolveMoodOptions(input.selections);

  const userId = await getCurrentUserId();
  const tasteProfile = userId
    ? await getTasteProfile(userId).catch((err) => {
        console.error("[mood] taste profile failed:", err);
        return null;
      })
    : null;
  const activeTaste = input.personalize ? tasteProfile : null;

  let results: MediaCardItem[];
  let usedFallback = false;
  let interpreted: Interpreted | null = null;

  try {
    const raw = await getMoodCompletion(
      MOOD_SYSTEM_PROMPT,
      buildUserMessage(input, selected, activeTaste),
    );
    console.log("[mood] raw LLM response:", raw);

    const parsed = llmMoodOutputSchema.parse(JSON.parse(extractJson(raw)));
    // The explicit Type control always wins over what the model inferred.
    if (input.mediaType !== "both") parsed.mediaType = input.mediaType;
    console.log("[mood] parsed LLM output:", parsed);

    interpreted = { genres: parsed.genres, keywordTerms: parsed.keywordTerms };
    results = await discoverFromMood(parsed, activeTaste);
  } catch (err) {
    console.error("[mood] LLM/discover path failed, using fallback:", err);
    usedFallback = true;
    const fallback = await fallbackDiscover(input, selected, activeTaste);
    results = fallback.results;
    interpreted = fallback.interpreted;
  }

  if (userId) {
    const beforeCount = results.length;
    results = await filterAlreadySaved(userId, results);
    console.log(
      `[mood] filtered saved items: ${beforeCount} -> ${results.length}`,
    );
  }

  return {
    results: results.slice(0, MAX_RESULTS),
    usedFallback,
    interpreted,
    taste: tasteProfile ? { genres: tasteProfile.topGenres } : null,
  };
}