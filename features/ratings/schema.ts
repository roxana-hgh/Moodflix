import { z } from "zod";

export const ratingMediaTypeSchema = z.enum(["MOVIE", "TV"]);

export const upsertRatingSchema = z.object({
  tmdbId: z.number().int().positive(),
  mediaType: ratingMediaTypeSchema,
    score: z
    .number()
    .min(0, "Score must be between 0 and 10")
    .max(10, "Score must be between 0 and 10")
    .multipleOf(0.5, "Score must be in steps of 0.5"),
  comment: z
    .string()
    .trim()
    .max(2000, "Comment is too long (max 2000 characters)")
    .nullish()
    .transform((v) => (v ? v : null)),
});

export const deleteRatingSchema = z.object({
  tmdbId: z.number().int().positive(),
  mediaType: ratingMediaTypeSchema,
});

export type UpsertRatingInput = z.input<typeof upsertRatingSchema>;
export type DeleteRatingInput = z.input<typeof deleteRatingSchema>;