import { MediaCard } from "./media-card";
import { QuickFavoriteButton } from "@/features/lists/components/quick-favorite-button";
import { AddToListDialog } from "@/features/lists/components/add-to-list-dialog";
import type { MediaCardItem } from "@/types/media";

interface MediaCardWithActionsProps extends MediaCardItem {
  initialFavorited?: boolean;
}

export function MediaCardWithActions({ initialFavorited = false, ...item }: MediaCardWithActionsProps) {
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
            initialFavorited={initialFavorited}
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