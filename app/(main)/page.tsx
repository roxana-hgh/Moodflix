
import HeroSec from "@/components/Home/HeroSection";
import SectionContext from "@/components/layout/SectionContext";
import SectionWrapper from "@/components/layout/SectionWrapper";
import { MediaCard } from "@/components/media/media-card";
import { MediaCarousel } from "@/components/shared/Slider/media-carousel";
import {
  getTrendingTv,
  getTrendingMovies,
  getPopularMovies,
  getPopularTv,
  getTopRatedMovies,
  getTopRatedTv,
} from "@/features/media/queries";

export default async function Home() {
  const [
    trendingTv,
    trendingMovies,
    popularMovies,
    popularTv,
    topRatedMovies,
    topRatedTv,
  ] = await Promise.all([
    getTrendingTv('week'),
    getTrendingMovies('week'),
    getPopularMovies(),
    getPopularTv(),
    getTopRatedMovies(),
    getTopRatedTv(),
  ]);

  return (
    <div className="flex flex-col gap-5">
      <HeroSec />

      <SectionWrapper>
        <div className="max-w-6xl px-4 sm:px-6 mx-auto" id="trending-tv">
          <SectionContext title="Trending TV Shows" buttonText="See More" ButtonLink="/shows" />
          <MediaCarousel itemsPerView={{ base: 2, sm: 3, md: 4, lg: 5, xl: 6 }} autoplay={false}>
            {trendingTv?.map((show) => (
              <MediaCard key={show.id} {...show} />
            ))}
          </MediaCarousel>
        </div>
      </SectionWrapper>

      <SectionWrapper>
        <div className="max-w-6xl px-4 sm:px-6 mx-auto">
          <SectionContext title="Trending Movies" buttonText="See More" ButtonLink="/movies" />
          <MediaCarousel itemsPerView={{ base: 2, sm: 3, md: 4, lg: 5, xl: 6 }} autoplay={false}>
            {trendingMovies?.map((movie) => (
              <MediaCard key={movie.id} {...movie} />
            ))}
          </MediaCarousel>
        </div>
      </SectionWrapper>

      <SectionWrapper>
        <div className="max-w-6xl px-4 sm:px-6 mx-auto">
          <SectionContext title="Popular Movies" buttonText="See More" ButtonLink="/learn-more" />
          <MediaCarousel itemsPerView={{ base: 2, sm: 3, md: 4, lg: 5, xl: 6 }} autoplay={false}>
            {popularMovies?.map((movie) => (
              <MediaCard key={movie.id} {...movie} />
            ))}
          </MediaCarousel>
        </div>
      </SectionWrapper>

      <SectionWrapper>
        <div className="max-w-6xl px-4 sm:px-6 mx-auto">
          <SectionContext title="Popular TV Shows" buttonText="See More" ButtonLink="/learn-more" />
          <MediaCarousel itemsPerView={{ base: 2, sm: 3, md: 4, lg: 5, xl: 6 }} autoplay={false}>
            {popularTv?.map((show) => (
              <MediaCard key={show.id} {...show} />
            ))}
          </MediaCarousel>
        </div>
      </SectionWrapper>

      <SectionWrapper>
        <div className="max-w-6xl px-4 sm:px-6 mx-auto">
          <SectionContext title="Top Rated Movies" buttonText="See More" ButtonLink="/learn-more" />
          <MediaCarousel itemsPerView={{ base: 2, sm: 3, md: 4, lg: 5, xl: 6 }} autoplay={false}>
            {topRatedMovies?.map((movie) => (
              <MediaCard key={movie.id} {...movie} />
            ))}
          </MediaCarousel>
        </div>
      </SectionWrapper>

      <SectionWrapper>
        <div className="max-w-6xl px-4 sm:px-6 mx-auto">
          <SectionContext title="Top Rated TV Shows" buttonText="See More" ButtonLink="/learn-more" />
          <MediaCarousel itemsPerView={{ base: 2, sm: 3, md: 4, lg: 5, xl: 6 }} autoplay={false}>
            {topRatedTv?.map((show) => (
              <MediaCard key={show.id} {...show} />
            ))}
          </MediaCarousel>
        </div>
      </SectionWrapper>
    </div>
  );
}