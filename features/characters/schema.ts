import { z } from "zod";

export const characterInputSchema = z.object({
  characterName: z.string().trim().min(1).max(200),
  actorId: z.number().int().positive(),
  actorName: z.string().trim().min(1).max(200),
  profilePath: z.string().nullable(),
  mediaTmdbId: z.number().int().positive(),
  mediaType: z.enum(["movie", "tv"]),
  mediaTitle: z.string().trim().min(1).max(300),
});

export type CharacterInput = z.infer<typeof characterInputSchema>;
export type FavoriteCharacter = CharacterInput & { id: string };