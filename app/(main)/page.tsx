import LoadingPage from "@/app/loading";
import HeroSec from "@/components/Home/HeroSection";
import SectionContext from "@/components/layout/SectionContext";
import SectionWrapper from "@/components/layout/SectionWrapper";
import { MediaCard } from "@/components/media/media-card";
import { MediaCarousel } from "@/components/shared/Slider/media-carousel";
import { getTrendingTv, getTrendingMovies } from "@/features/media/queries";

export default async function Home() {
  const [trendingTv, trendingMovies] = await Promise.all([
    getTrendingTv('week'),
    getTrendingMovies('week'),
  ]);

  return (
    <div className="flex flex-col gap-5">
      <HeroSec />
      <SectionWrapper>
        <div className="max-w-6xl px-4 sm:px-6 mx-auto">
          <SectionContext title="Trending TV Shows" buttonText="See More" ButtonLink="/learn-more" />

          <MediaCarousel itemsPerView={{ base: 2, sm: 3, md: 4, lg: 5, xl: 6 }}  autoplay={false}>
            {trendingTv?.map((show) => (
              <MediaCard key={show.id} {...show} />
            ))}
          </MediaCarousel>
        </div>
      </SectionWrapper>

      <SectionWrapper>
        <div className="max-w-6xl px-4 sm:px-6 mx-auto">
          <SectionContext title="Trending Movies" buttonText="See More" ButtonLink="/learn-more" />

          <MediaCarousel itemsPerView={{ base: 2, sm: 3, md: 4, lg: 5, xl: 6 }}  autoplay={false}>
            {trendingMovies?.map((movie) => (
              <MediaCard key={movie.id} {...movie} />
            ))}
          </MediaCarousel>
        </div>
      </SectionWrapper>
    </div>
  );
}