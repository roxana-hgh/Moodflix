import { MediaCard } from "./media-card";
import { QuickFavoriteButton } from "@/features/lists/components/quick-favorite-button";

import { AddToListDialog } from "@/features/lists/components/add-to-list-dialog";
import type { MediaCardItem } from "@/types/media";
import { QuickWatchedButton } from "@/features/media/components/quick-watched-button";

/** Saved state for the quick buttons comes from the viewer library, so this card renders the same for everyone and can be cached. */
export function MediaCardWithActions(item: MediaCardItem) {
  return (
    <MediaCard
      {...item}
      actions={
        <>
          <QuickFavoriteButton
            tmdbId={item.id}
            mediaType={item.mediaType}
            title={item.title}
            posterPath={item.posterPath}
            releaseYear={item.releaseYear}
          />
          <QuickWatchedButton
            tmdbId={item.id}
            mediaType={item.mediaType}
            title={item.title}
            posterPath={item.posterPath}
            releaseYear={item.releaseYear}
          />
          <AddToListDialog
            tmdbId={item.id}
            mediaType={item.mediaType}
            title={item.title}
            posterPath={item.posterPath}
            releaseYear={item.releaseYear}
          />
        </>
      }
    />
  );
}