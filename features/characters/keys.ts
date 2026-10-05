export function toCharacterKey(
  mediaType: "movie" | "tv",
  mediaTmdbId: number,
  characterName: string,
) {
  return `${mediaType}:${mediaTmdbId}:${characterName}`;
}