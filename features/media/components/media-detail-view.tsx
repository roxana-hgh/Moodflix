import { Suspense } from "react";
import { connection } from "next/server";
import SectionContext from "@/components/layout/section-context";
import SectionWrapper from "@/components/layout/section-wrapper";
import { MediaCardWithActions } from "@/components/media/media-card-with-actions";
import { MediaCarousel } from "@/components/shared/media-carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { getFavoriteCharacterNames } from "@/features/characters/queries";
import { toListMediaType } from "@/features/lists/types";
import { RateMediaCard } from "@/features/ratings/components/rate-media-card";
import { RatingSummary } from "@/features/ratings/components/rating-summary";
import { getMediaRatingStats, getMoodflixReviews, getUserRating } from "@/features/ratings/queries";
import { getCurrentUserId } from "@/lib/auth";
import type { MediaCardItem } from "@/types/media";
import type { MediaDetail } from "../types";
import { BackdropGallery } from "./backdrop-gallery";
import { CastList } from "./cast-list";
import { MediaDetailHero } from "./media-detail-hero";
import { MediaInfoGrid } from "./media-info-grid";
import { ReviewsSection } from "./reviews-section";
import { SeasonsList } from "./seasons-list";
import { VideoGallery } from "./video-gallery";

/**
 * Movie or TV detail. Everything that comes from TMDB renders from the cached
 * `detail`, so it is part of the static shell. The three Moodflix parts that
 * change per vote or per viewer stream in behind their own Suspense boundaries.
 */
export function MediaDetailView({ detail }: { detail: MediaDetail }) {
  const tmdbStats = {
    average: detail.voteAverage ? Math.round(detail.voteAverage * 10) / 10 : null,
    count: detail.voteCount,
  };
  const media = { tmdbId: detail.id, mediaType: detail.mediaType, title: detail.title };

  return (
    <div className="pb-16 -mt-(--header-height)">
      <MediaDetailHero
        detail={detail}
        ratingSummary={
          <Suspense fallback={<RatingSummary tmdb={tmdbStats} moodflix={null} />}>
            <HeroRatingSummary detail={detail} tmdbStats={tmdbStats} />
          </Suspense>
        }
      />

      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 pt-8 sm:px-6">
        <MediaInfoGrid detail={detail} />
        {detail.mediaType === "tv" && <SeasonsList tvId={detail.id} seasons={detail.seasons} />}
        {/* The fallback is the same list without hearts, so nothing shifts when it resolves. */}
        <Suspense fallback={<CastList cast={detail.cast} media={media} favoriteNames={[]} />}>
          <CastWithFavorites detail={detail} />
        </Suspense>
        <BackdropGallery backdrops={detail.backdrops} title={detail.title} />
        <VideoGallery videos={detail.videos} title={detail.title} />

        <Suspense fallback={<CommunitySkeleton />}>
          <CommunitySection detail={detail} />
        </Suspense>

        <MediaCarouselSection title="Recommendations" items={detail.recommendations} />
        <MediaCarouselSection
          title={`Similar ${detail.mediaType === "tv" ? "shows" : "movies"}`}
          items={detail.similar}
        />
      </div>
    </div>
  );
}

function MediaCarouselSection({ title, items }: { title: string; items: MediaCardItem[] }) {
  if (items.length === 0) return null;

  return (
    <SectionWrapper>
      <SectionContext title={title} />
      <MediaCarousel itemsPerView={{ base: 2, sm: 3, md: 4, lg: 5, xl: 6 }}>
        {items.map((item) => (
          <MediaCardWithActions key={item.id} {...item} />
        ))}
      </MediaCarousel>
    </SectionWrapper>
  );
}

// ───────────────────────── Dynamic islands ─────────────────────────
// `connection()` keeps these out of the prerender, so builds never query the database.

async function HeroRatingSummary({
  detail,
  tmdbStats,
}: {
  detail: MediaDetail;
  tmdbStats: { average: number | null; count: number };
}) {
  await connection();
  const moodflix = await getMediaRatingStats(detail.id, toListMediaType(detail.mediaType));
  return <RatingSummary tmdb={tmdbStats} moodflix={moodflix} />;
}

async function CastWithFavorites({ detail }: { detail: MediaDetail }) {
  const userId = await getCurrentUserId();
  const favoriteNames = userId ? await getFavoriteCharacterNames(userId, detail.mediaType, detail.id) : [];

  return (
    <CastList
      cast={detail.cast}
      media={{ tmdbId: detail.id, mediaType: detail.mediaType, title: detail.title }}
      favoriteNames={favoriteNames}
    />
  );
}

async function CommunitySection({ detail }: { detail: MediaDetail }) {
  const listMediaType = toListMediaType(detail.mediaType);
  const userId = await getCurrentUserId();

  const [moodflixReviews, myRating] = await Promise.all([
    getMoodflixReviews(detail.id, listMediaType),
    userId ? getUserRating(userId, detail.id, listMediaType) : Promise.resolve(null),
  ]);

  // Moodflix comments first (newest), then TMDB's.
  const allReviews = [...moodflixReviews, ...detail.reviews];

  return (
    <>
      <SectionWrapper>
        <RateMediaCard
          key={`${myRating?.score ?? "none"}-${myRating?.comment ?? ""}`}
          tmdbId={detail.id}
          mediaType={listMediaType}
          title={detail.title}
          isSignedIn={!!userId}
          initialRating={myRating}
        />
      </SectionWrapper>

      {allReviews.length > 0 && (
        <SectionWrapper>
          <ReviewsSection reviews={allReviews} />
        </SectionWrapper>
      )}
    </>
  );
}

function CommunitySkeleton() {
  return (
    <SectionWrapper>
      <Skeleton className="h-40 w-full rounded-2xl" />
    </SectionWrapper>
  );
}
