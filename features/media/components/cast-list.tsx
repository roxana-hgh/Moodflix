import { MediaCarousel } from "@/components/shared/Slider/media-carousel";

import { FavoriteCharacterButton } from "@/features/characters/components/favorite-character-button";
import type { CastMember } from "../types";
import { PortraitTile } from "@/features/media/components/portrait-tile";

type Props = {
  cast: CastMember[];
  media: { tmdbId: number; mediaType: "movie" | "tv"; title: string };
  favoriteNames: string[];
};

export function CastList({ cast, media, favoriteNames }: Props) {
  if (cast.length === 0) return null;
  const favorites = new Set(favoriteNames);

  return (
    <div>
      <h2 className="mb-4 text-sm font-semibold text-primary">Cast</h2>
      <MediaCarousel itemsPerView={{ base: 2, sm: 3, md: 4, lg: 6, xl: 7 }} autoplay={false}>
        {cast.map((member, i) => (
          <PortraitTile
            key={`${member.id}-${i}`}
            href={`/person/${member.id}`}
            imagePath={member.profilePath}
            imageAlt={member.name}
            title={member.name}
            subtitle={member.character || undefined}
            action={
              member.character ? (
                <FavoriteCharacterButton
                  initialFavorite={favorites.has(member.character)}
                  character={{
                    characterName: member.character,
                    actorId: member.id,
                    actorName: member.name,
                    profilePath: member.profilePath,
                    mediaTmdbId: media.tmdbId,
                    mediaType: media.mediaType,
                    mediaTitle: media.title,
                  }}
                />
              ) : null
            }
          />
        ))}
      </MediaCarousel>
    </div>
  );
}