
import { MediaDetailHero } from "./media-detail-hero";
import { MediaInfoGrid } from "./media-info-grid";
import { CastList } from "./cast-list";
import { BackdropGallery } from "./backdrop-gallery";
import type { MediaDetail } from "../types";
import { MediaCarousel } from "@/components/shared/Slider/media-carousel";
import SectionContext from "@/components/layout/SectionContext";
import SectionWrapper from "@/components/layout/SectionWrapper";
import { SeasonsList } from "@/features/media/components/seasons-list";
import { getCurrentUserId } from "@/lib/auth";
import { MediaCardItem } from "@/types/media";
import { toListMediaType } from "@/features/lists/types";
import { getFavoritedKeys, getWatchedKeys, toFavoritedKey } from "@/features/lists/queries";
import { MediaCardWithActions } from "@/components/media/media-card-with-actions";

export async function MediaDetailView({ detail, initialFavorited, initialWatchlisted, initialWatched }: { detail: MediaDetail; initialFavorited: boolean; initialWatchlisted: boolean; initialWatched: boolean }) {
  const userId = await getCurrentUserId();

  const allItems: MediaCardItem[] = [

    ...(detail.recommendations ?? []),
    ...(detail.similar ?? []),
  ];

  const [favoritedKeys, watchedKeys] = userId
    ? await Promise.all([
      getFavoritedKeys(userId, allItems.map((item) => ({ tmdbId: item.id, mediaType: toListMediaType(item.mediaType) }))),
      getWatchedKeys(userId, allItems.map((item) => ({ tmdbId: item.id, mediaType: toListMediaType(item.mediaType) }))),
    ])
    : [new Set<string>(), new Set<string>()];

  const isFavorited = (item: MediaCardItem) =>
    favoritedKeys.has(toFavoritedKey(item.id, toListMediaType(item.mediaType)));
  const isWatched = (item: MediaCardItem) =>
    watchedKeys.has(toFavoritedKey(item.id, toListMediaType(item.mediaType)));



  return (
    <div className="pb-16 -mt-(--header-height)">
      <MediaDetailHero initialFavorited={initialFavorited}
        initialWatchlisted={initialWatchlisted}
        initialWatched={initialWatched}
        detail={detail} />

      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 pt-8 sm:px-6">
        <MediaInfoGrid detail={detail} />
        {detail.mediaType === "tv" && <SeasonsList tvId={detail.id} seasons={detail.seasons} />}
        <CastList cast={detail.cast} />
        <BackdropGallery backdrops={detail.backdrops} title={detail.title} />

        {detail.recommendations.length > 0 && (

          <SectionWrapper>
            <SectionContext title="Recommendations" />

            <MediaCarousel itemsPerView={{ base: 2, sm: 3, md: 4, lg: 5, xl: 6 }}>
              {detail.recommendations.map((item) => (

                <MediaCardWithActions key={item.id} {...item} initialWatched={isWatched(item)} initialFavorited={isFavorited(item)} />
              ))}
            </MediaCarousel>
          </SectionWrapper>
        )}

        {detail.similar.length > 0 && (
          <SectionWrapper>

            <SectionContext title={`Similar ${detail.mediaType === "tv" ? "shows" : "movies"}`} />

            <MediaCarousel itemsPerView={{ base: 2, sm: 3, md: 4, lg: 5, xl: 6 }}>
              {detail.similar.map((item) => (
                <MediaCardWithActions key={item.id} {...item} initialWatched={isWatched(item)} initialFavorited={isFavorited(item)} />
              ))}
            </MediaCarousel>
          </SectionWrapper>
        )}
      </div>
    </div>
  );
}