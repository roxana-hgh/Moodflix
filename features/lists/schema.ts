import { z } from "zod";

export const listMediaTypeSchema = z.enum(["MOVIE", "TV"]);

const mediaRefSchema = z.object({
  tmdbId: z.number().int().positive(),
  mediaType: listMediaTypeSchema,
  title: z.string().min(1).max(500),
  posterPath: z.string().nullable(),
  releaseYear: z.string().nullable().optional(),
});

export const createListSchema = z.object({
  name: z.string().min(1, "List name is required").max(100),
  isPublic: z.boolean().default(false),
});

export const addToListSchema = mediaRefSchema.extend({
  listId: z.string().cuid(),
});

export const removeFromListSchema = z.object({
  listId: z.string().cuid(),
  tmdbId: z.number().int().positive(),
  mediaType: listMediaTypeSchema,
});

export const toggleQuickListSchema = mediaRefSchema.extend({
  listType: z.enum(["WATCHLIST", "FAVORITE"]),
});

export const updateListSchema = z.object({
  listId: z.string().cuid(),
  name: z.string().min(1, "List name is required").max(100),
  isPublic: z.boolean(),
});

export const deleteListSchema = z.object({
  listId: z.string().cuid(),
});



export type CreateListInput = z.infer<typeof createListSchema>;
export type AddToListInput = z.infer<typeof addToListSchema>;
export type RemoveFromListInput = z.infer<typeof removeFromListSchema>;
export type ToggleQuickListInput = z.infer<typeof toggleQuickListSchema>;
export type UpdateListInput = z.infer<typeof updateListSchema>;
export type DeleteListInput = z.infer<typeof deleteListSchema>;