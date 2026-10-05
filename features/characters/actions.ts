"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/services/db/prisma";

import { characterInputSchema, type CharacterInput } from "./schema";
import { getCurrentUserId } from "@/lib/auth";
import { toListMediaType } from "@/features/lists/types";

type ActionResult<T = undefined> =
  | { success: true; data?: T }
  | { success: false; error: string };

export async function toggleFavoriteCharacter(
  input: CharacterInput,
): Promise<ActionResult<{ isFavorite: boolean }>> {
  const userId = await getCurrentUserId();
  if (!userId) return { success: false, error: "Not authenticated" };

  const parsed = characterInputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { mediaType, actorId, actorName, profilePath, mediaTitle, ...identity } = parsed.data;
  const where = { userId, mediaType: toListMediaType(mediaType), ...identity };

  const { count } = await prisma.favoriteCharacter.deleteMany({ where });
  if (count === 0) {
    await prisma.favoriteCharacter.createMany({
      data: [{ ...where, actorId, actorName, profilePath, mediaTitle }],
      skipDuplicates: true,
    });
  }

  revalidatePath("/profile");
  revalidatePath("/profile/characters");
  revalidatePath(`/${mediaType === "movie" ? "movies" : "tv"}/${identity.mediaTmdbId}`);

  return { success: true, data: { isFavorite: count === 0 } };
}