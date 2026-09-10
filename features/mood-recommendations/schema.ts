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

// Raw user input from the mood search bar
export const moodInputSchema = z.object({
  mood: z
    .string()
    .trim()
    .min(3, "Tell us a bit more about the mood")
    .max(200, "Keep it under 200 characters"),
});

export type MoodInput = z.infer<typeof moodInputSchema>;

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