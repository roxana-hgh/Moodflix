import { z } from "zod";

export const TMDB_GENRES = [
  "Action",
  "Adventure",
  "Animation",
  "Comedy",
  "Crime",
  "Documentary",
  "Drama",
  "Family",
  "Fantasy",
  "History",
  "Horror",
  "Music",
  "Mystery",
  "Romance",
  "Science Fiction",
  "TV Movie",
  "Thriller",
  "War",
  "Western",
] as const;

export type TmdbGenre = (typeof TMDB_GENRES)[number];

export const MAX_MOOD_SELECTIONS = 5;

// Raw user input from the mood search bar: picked chips + optional free text.
// Chip ids are validated against `constants.ts` at resolve time (unknown ids are dropped),
// so this schema stays free of a circular import.
export const moodInputSchema = z
  .object({
    text: z.string().trim().max(200, "Keep it under 200 characters").default(""),
    selections: z
      .array(z.string().max(40))
      .max(MAX_MOOD_SELECTIONS, `Pick up to ${MAX_MOOD_SELECTIONS}`)
      .default([]),
    mediaType: z.enum(["movie", "tv", "both"]).default("both"),
    personalize: z.boolean().default(true),
  })
  .refine((v) => v.text.length >= 3 || v.selections.length > 0, {
    message: "Pick a mood or tell us a bit more",
    path: ["text"],
  });

export type MoodInput = z.infer<typeof moodInputSchema>;

// What the search bar hands to the page (personalize is added by the page).
export type MoodSearchRequest = Pick<MoodInput, "text" | "selections" | "mediaType">;

// Structured output we ask the LLM for
export const llmMoodOutputSchema = z.object({
  genres: z
    .array(z.enum(TMDB_GENRES))
    .transform((arr) => arr.slice(0, 3))
    .default([]),
  keywordTerms: z
    .array(z.string().trim().toLowerCase())
    .transform((arr) => arr.slice(0, 6))
    .default([]),
  avoidTerms: z
    .array(z.string().trim().toLowerCase())
    .transform((arr) => arr.slice(0, 3))
    .default([]),
  mediaType: z.enum(["movie", "tv", "both"]).default("both"),
  sortBy: z.enum(["popularity", "rating"]).default("popularity"),
});

export type LlmMoodOutput = z.infer<typeof llmMoodOutputSchema>;