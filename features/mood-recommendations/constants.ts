import type { TmdbGenre } from "./schema";

// Pure data (no icons, no server imports) so both the client picker and the
// server action can use it. Icons live in components/mood-picker.tsx, keyed by option id.

export type MoodGroupId = "mood" | "occasion" | "vibe";

export interface MoodGroup {
  id: MoodGroupId;
  label: string;
  /** Max chips selectable inside this group (overall cap is MAX_MOOD_SELECTIONS). */
  maxSelected: number;
}

export interface MoodOption {
  id: string;
  label: string;
  group: MoodGroupId;
  /**
   * Hints used ONLY when the LLM path fails — the LLM itself gets just the label.
   * Keywords must be literal and searchable (they go through TMDB's keyword search).
   */
  genres: readonly TmdbGenre[];
  keywords: readonly string[];
  avoid: readonly string[];
  mediaType?: "movie" | "tv";
  sortBy?: "popularity" | "rating";
}

export const MOOD_GROUPS: readonly MoodGroup[] = [
  { id: "mood", label: "Mood", maxSelected: 2 },
  { id: "occasion", label: "Occasion", maxSelected: 1 },
  { id: "vibe", label: "Vibe", maxSelected: 3 },
];

export const MOOD_OPTIONS: readonly MoodOption[] = [
  // ── Mood ──────────────────────────────────────────────
  { id: "happy", label: "Happy", group: "mood", genres: ["Comedy", "Family"], keywords: [], avoid: ["tragedy"] },
  { id: "sad", label: "Sad", group: "mood", genres: ["Drama"], keywords: ["grief"], avoid: [] },
  { id: "chill", label: "Chill", group: "mood", genres: ["Comedy"], keywords: ["slice of life"], avoid: ["violence"] },
  { id: "romantic", label: "Romantic", group: "mood", genres: ["Romance"], keywords: [], avoid: [] },
  { id: "excited", label: "Excited", group: "mood", genres: ["Action", "Adventure"], keywords: [], avoid: [] },
  { id: "curious", label: "Curious", group: "mood", genres: ["Documentary", "Mystery"], keywords: [], avoid: [] },
  { id: "nostalgic", label: "Nostalgic", group: "mood", genres: [], keywords: ["nostalgia", "coming of age"], avoid: [] },
  { id: "heartbroken", label: "Heartbroken", group: "mood", genres: ["Romance", "Drama"], keywords: ["breakup"], avoid: [] },

  // ── Occasion ──────────────────────────────────────────
  { id: "date-night", label: "Date night", group: "occasion", genres: ["Romance", "Comedy"], keywords: [], avoid: [] },
  { id: "family-night", label: "Family night", group: "occasion", genres: ["Family", "Animation"], keywords: [], avoid: [] },
  { id: "rainy-day", label: "Rainy day", group: "occasion", genres: ["Drama", "Romance"], keywords: ["rain"], avoid: [] },
  { id: "comfort-watch", label: "Comfort watch", group: "occasion", genres: ["Comedy", "Family"], keywords: ["friendship"], avoid: ["violence"] },
  { id: "background-watch", label: "Background watch", group: "occasion", genres: ["Comedy", "Animation"], keywords: [], avoid: [] },
  { id: "binge-worthy", label: "Binge-worthy", group: "occasion", genres: [], keywords: [], avoid: [], mediaType: "tv" },

  // ── Vibe ──────────────────────────────────────────────
  { id: "slow-burn", label: "Slow-burn", group: "vibe", genres: ["Mystery", "Drama"], keywords: [], avoid: [] },
  { id: "mind-bending", label: "Mind-bending", group: "vibe", genres: ["Science Fiction", "Mystery"], keywords: ["time travel", "parallel world"], avoid: [] },
  { id: "suspense", label: "Suspense", group: "vibe", genres: ["Thriller", "Mystery"], keywords: [], avoid: [] },
  { id: "tearjerker", label: "Tearjerker", group: "vibe", genres: ["Drama", "Romance"], keywords: ["grief"], avoid: [] },
  { id: "dark-twisted", label: "Dark & twisted", group: "vibe", genres: ["Thriller", "Crime"], keywords: ["twist ending"], avoid: [] },
  { id: "hidden-gems", label: "Hidden gems", group: "vibe", genres: [], keywords: [], avoid: [], sortBy: "rating" },
  { id: "true-crime", label: "True crime", group: "vibe", genres: ["Crime", "Documentary"], keywords: ["true crime"], avoid: [] },
  { id: "prestige-drama", label: "Prestige drama", group: "vibe", genres: ["Drama"], keywords: [], avoid: [], sortBy: "rating" },
  { id: "high-stakes", label: "High-stakes", group: "vibe", genres: ["Action", "Thriller"], keywords: [], avoid: [] },
];

const OPTION_BY_ID = new Map(MOOD_OPTIONS.map((o) => [o.id, o]));

/** Maps raw ids from the client to known options; drops unknown ids and duplicates. */
export function resolveMoodOptions(ids: readonly string[]): MoodOption[] {
  const resolved: MoodOption[] = [];
  for (const id of new Set(ids)) {
    const option = OPTION_BY_ID.get(id);
    if (option) resolved.push(option);
  }
  return resolved;
}