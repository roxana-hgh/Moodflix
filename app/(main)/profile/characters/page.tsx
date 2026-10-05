import { redirect } from "next/navigation";
import { getCurrentUserProfile } from "@/features/profile/queries";
import { getFavoriteCharacters } from "@/features/characters/queries";

import { FavoriteCharacterButton } from "@/features/characters/components/favorite-character-button";
import { characterHref } from "@/features/characters/components/favorite-characters-section";
import { PortraitTile } from "@/features/media/components/portrait-tile";

export default async function FavoriteCharactersPage() {
  const profile = await getCurrentUserProfile();
  if (!profile) redirect("/login");
  const characters = await getFavoriteCharacters(profile.id);

  return (
    <div className="container mx-auto py-5">
      <h1 className="mb-4 text-lg font-semibold">Favorite Characters</h1>
      {characters.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">No favorite characters yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
          {characters.map((c) => (
            <PortraitTile
              key={c.id}
              href={characterHref(c)}
              imagePath={c.profilePath}
              imageAlt={c.actorName}
              title={c.characterName}
              subtitle={c.mediaTitle}
              action={<FavoriteCharacterButton initialFavorite character={c} />}
            />
          ))}
        </div>
      )}
    </div>
  );
}