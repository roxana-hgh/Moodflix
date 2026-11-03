import { Suspense } from "react";
import { MediaRow } from "@/components/media/media-row";
import { HeroSection } from "@/features/home/components/hero-section";
import {
  getPopularMovies,
  getPopularTv,
  getTopRatedMovies,
  getTopRatedTv,
  getTrendingMovies,
  getTrendingTv,
} from "@/features/media/queries";
import { ReviewsSection, ReviewsSectionSkeleton } from "@/features/reviews/components/reviews-section";
import { getLatestReviews } from "@/features/reviews/queries";
import { getCurrentUserId } from "@/lib/auth";

export const instant = true;

export default async function HomePage() {
  // All cached and shared by every visitor, so these rows are part of the prerendered shell.
  const [trendingTv, trendingMovies, popularMovies, popularTv, topRatedMovies, topRatedTv] = await Promise.all([
    getTrendingTv("week"),
    getTrendingMovies("week"),
    getPopularMovies(),
    getPopularTv(),
    getTopRatedMovies(),
    getTopRatedTv(),
  ]);

  return (
    <div className="flex flex-col gap-5">
      <HeroSection />

      <MediaRow id="trending-tv" title="Trending TV Shows" seeMoreHref="/shows" items={trendingTv} />
      <MediaRow title="Trending Movies" seeMoreHref="/movies" items={trendingMovies} />
      <MediaRow title="Popular Movies" seeMoreHref="/movies" items={popularMovies} />
      <MediaRow title="Popular TV Shows" seeMoreHref="/shows" items={popularTv} />
      <MediaRow title="Top Rated Movies" seeMoreHref="/movies?sort=topRated" items={topRatedMovies} />
      <MediaRow title="Top Rated TV Shows" seeMoreHref="/shows?sort=topRated" items={topRatedTv} />

      <div className="max-w-6xl px-4 sm:px-6 mx-auto w-full">
        <Suspense fallback={<ReviewsSectionSkeleton title="Latest Reviews" />}>
          <LatestReviews />
        </Suspense>
      </div>
    </div>
  );
}

/** Per-viewer (liked state), so it streams in after the shell. */
async function LatestReviews() {
  const userId = await getCurrentUserId();
  const reviews = await getLatestReviews(9, userId);

  return (
    <ReviewsSection
      title="Latest Reviews"
      seeAllHref="/reviews"
      reviews={reviews}
      isAuthenticated={userId !== null}
      emptyText="No reviews yet. Be the first to write one!"
    />
  );
}
