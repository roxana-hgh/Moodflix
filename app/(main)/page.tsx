
import HeroSec from "@/components/Home/HeroSection";
import SectionContext from "@/components/layout/SectionContext";
import SectionWrapper from "@/components/layout/SectionWrapper";
import { MediaCard } from "@/components/media/media-card";
import { MediaCardWithActions } from "@/components/media/media-card-with-actions";
import { MediaCarousel } from "@/components/shared/Slider/media-carousel";
import { getFavoritedKeys, getWatchedKeys, toFavoritedKey } from "@/features/lists/queries";
import { toListMediaType } from "@/features/lists/types";
import {
  getTrendingTv,
  getTrendingMovies,
  getPopularMovies,
  getPopularTv,
  getTopRatedMovies,
  getTopRatedTv,
} from "@/features/media/queries";
import { getCurrentUserId } from "@/lib/auth";
import { MediaCardItem } from "@/types/media";

export default async function Home() {
    const [trendingTv, trendingMovies, popularMovies, popularTv, topRatedMovies, topRatedTv] =
    await Promise.all([
      getTrendingTv("week"),
      getTrendingMovies("week"),
      getPopularMovies(),
      getPopularTv(),
      getTopRatedMovies(),
      getTopRatedTv(),
    ]);

  const userId = await getCurrentUserId();

  const allItems: MediaCardItem[] = [
    ...(trendingTv ?? []),
    ...(trendingMovies ?? []),
    ...(popularMovies ?? []),
    ...(popularTv ?? []),
    ...(topRatedMovies ?? []),
    ...(topRatedTv ?? []),
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
    <div className="flex flex-col gap-5">
      <HeroSec />

      <SectionWrapper>
        <div className="max-w-6xl px-4 sm:px-6 mx-auto" id="trending-tv">
          <SectionContext title="Trending TV Shows" buttonText="See More" ButtonLink="/shows" />
          <MediaCarousel itemsPerView={{ base: 2, sm: 3, md: 4, lg: 5, xl: 6 }} autoplay={false}>
            {trendingTv?.map((show) => (
               <MediaCardWithActions key={show.id} {...show} initialWatched={isWatched(show)} initialFavorited={isFavorited(show)} />
            ))}
          </MediaCarousel>
        </div>
      </SectionWrapper>

      <SectionWrapper>
        <div className="max-w-6xl px-4 sm:px-6 mx-auto">
          <SectionContext title="Trending Movies" buttonText="See More" ButtonLink="/movies" />
          <MediaCarousel itemsPerView={{ base: 2, sm: 3, md: 4, lg: 5, xl: 6 }} autoplay={false}>
            {trendingMovies?.map((movie) => (
               <MediaCardWithActions key={movie.id} {...movie} initialWatched={isWatched(movie)} initialFavorited={isFavorited(movie)} />
            ))}
          </MediaCarousel>
        </div>
      </SectionWrapper>

      <SectionWrapper>
        <div className="max-w-6xl px-4 sm:px-6 mx-auto">
          <SectionContext title="Popular Movies" buttonText="See More" ButtonLink="/movies" />
          <MediaCarousel itemsPerView={{ base: 2, sm: 3, md: 4, lg: 5, xl: 6 }} autoplay={false}>
            {popularMovies?.map((movie) => (
                <MediaCardWithActions key={movie.id} {...movie} initialWatched={isWatched(movie)} initialFavorited={isFavorited(movie)} />
               
            ))}
          </MediaCarousel>
        </div>
      </SectionWrapper>

      <SectionWrapper>
        <div className="max-w-6xl px-4 sm:px-6 mx-auto">
          <SectionContext title="Popular TV Shows" buttonText="See More" ButtonLink="/shows" />
          <MediaCarousel itemsPerView={{ base: 2, sm: 3, md: 4, lg: 5, xl: 6 }} autoplay={false}>
            {popularTv?.map((show) => (
              <MediaCardWithActions key={show.id} {...show} initialWatched={isWatched(show)} initialFavorited={isFavorited(show)} />
            ))}
          </MediaCarousel>
        </div>
      </SectionWrapper>

      <SectionWrapper>
        <div className="max-w-6xl px-4 sm:px-6 mx-auto">
          <SectionContext title="Top Rated Movies" buttonText="See More" ButtonLink="/movies?sort=topRated" />
          <MediaCarousel itemsPerView={{ base: 2, sm: 3, md: 4, lg: 5, xl: 6 }} autoplay={false}>
            {topRatedMovies?.map((movie) => (
              <MediaCardWithActions key={movie.id} {...movie} initialWatched={isWatched(movie)} initialFavorited={isFavorited(movie)} />
            ))}
          </MediaCarousel>
        </div>
      </SectionWrapper>

      <SectionWrapper>
        <div className="max-w-6xl px-4 sm:px-6 mx-auto">
          <SectionContext title="Top Rated TV Shows" buttonText="See More" ButtonLink="/shows?sort=topRated" />
          <MediaCarousel itemsPerView={{ base: 2, sm: 3, md: 4, lg: 5, xl: 6 }} autoplay={false}>
            {topRatedTv?.map((show) => (
              <MediaCardWithActions key={show.id} {...show} initialWatched={isWatched(show)} initialFavorited={isFavorited(show)} />
            ))}
          </MediaCarousel>
        </div>
      </SectionWrapper>
    </div>
  );
}