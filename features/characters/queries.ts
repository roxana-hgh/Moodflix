import "server-only";
import { prisma } from "@/services/db/prisma";

import type { FavoriteCharacter } from "./schema";
import { toListMediaType } from "@/features/lists/types";


export async function getFavoriteCharacters(
  userId: string,
  limit?: number,
): Promise<FavoriteCharacter[]> {
  const rows = await prisma.favoriteCharacter.findMany({
    where: { userId },
    orderBy: { addedAt: "desc" },
    take: limit,
  });

  return rows.map((r) => ({
    id: r.id,
    characterName: r.characterName,
    actorId: r.actorId,
    actorName: r.actorName,
    profilePath: r.profilePath,
    mediaTmdbId: r.mediaTmdbId,
    mediaType: r.mediaType === "MOVIE" ? "movie" : "tv",
    mediaTitle: r.mediaTitle,
  }));
}

export async function getFavoriteCharacterNames(
  userId: string,
  mediaType: "movie" | "tv",
  mediaTmdbId: number,
): Promise<string[]> {
  const rows = await prisma.favoriteCharacter.findMany({
    where: { userId, mediaTmdbId, mediaType: toListMediaType(mediaType) },
    select: { characterName: true },
  });
  return rows.map((r) => r.characterName);
}