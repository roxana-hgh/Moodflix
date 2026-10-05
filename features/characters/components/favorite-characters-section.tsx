import Link from "next/link";
import { Button } from "@/components/ui/button";
import SectionWrapper from "@/components/layout/SectionWrapper";
import { MediaCarousel } from "@/components/shared/Slider/media-carousel";
import { FavoriteCharacterButton } from "./favorite-character-button";
import { toCharacterKey } from "../keys";
import type { FavoriteCharacter } from "../schema";
import { PortraitTile } from "@/features/media/components/portrait-tile";
import { AddCharacterDialog } from "@/features/characters/components/add-character-dialog";
import SectionContext from "@/components/layout/SectionContext";

export function characterHref(c: FavoriteCharacter) {
  return `/${c.mediaType === "movie" ? "movies" : "tv"}/${c.mediaTmdbId}`;
}

export function FavoriteCharactersSection({ characters }: { characters: FavoriteCharacter[] }) {
  const favoriteKeys = characters.map((c) => toCharacterKey(c.mediaType, c.mediaTmdbId, c.characterName));

  return (
    <SectionWrapper>
      <div className="mx-auto">
        {/* <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-base font-semibold">Favorite Characters</h2>
          <div className="flex items-center gap-2">
            <AddCharacterDialog favoriteKeys={favoriteKeys} />
            <Button asChild size="sm">
              <Link href="/profile/characters">All</Link>
            </Button>
          </div>
        </div> */}
          <SectionContext title="Favorite Characters" buttonText="See all" ButtonLink="/profile/characters" />

        {characters.length === 0 ? (
          <p className="py-3 text-center text-sm text-muted-foreground">No favorite characters yet.</p>
        ) : (
          <MediaCarousel itemsPerView={{ base: 2, sm: 3, md: 4, lg: 6, xl: 8 }} autoplay={false}>
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
            
             <AddCharacterDialog favoriteKeys={favoriteKeys} />
          
          </MediaCarousel>
        )}
      </div>
    </SectionWrapper>
  );
}