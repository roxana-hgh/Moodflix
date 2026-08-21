
import { MediaCard } from "@/components/media/media-card";
import { MediaDetailHero } from "./media-detail-hero";
import { MediaInfoGrid } from "./media-info-grid";
import { CastList } from "./cast-list";
import { BackdropGallery } from "./backdrop-gallery";
import type { MediaDetail } from "../types";
import { MediaCarousel } from "@/components/shared/Slider/media-carousel";
import SectionContext from "@/components/layout/SectionContext";
import SectionWrapper from "@/components/layout/SectionWrapper";

export function MediaDetailView({ detail }: { detail: MediaDetail }) {
  return (
    <div className="pb-16 -mt-[var(--header-height)]">
      <MediaDetailHero detail={detail} />

      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 pt-8 sm:px-6">
        <MediaInfoGrid detail={detail} />
        <CastList cast={detail.cast.splice(0, 12)} />
        <BackdropGallery backdrops={detail.backdrops} title={detail.title} />

        {detail.recommendations.length > 0 && (
          

            <SectionWrapper>
          <SectionContext title="Recommendations"  />

          <MediaCarousel itemsPerView={{ base: 2, sm: 3, md: 4, lg: 5, xl: 6 }}>
              {detail.recommendations.map((item) => (
                <MediaCard key={item.id} {...item} />
              ))}
            </MediaCarousel>
        </SectionWrapper>
        )}

        {detail.similar.length > 0 && (
          <SectionWrapper>
      
            <SectionContext title={`Similar ${detail.mediaType === "tv" ? "shows" : "movies"}`}  />

            <MediaCarousel itemsPerView={{ base: 2, sm: 3, md: 4, lg: 5, xl: 6 }}>
              {detail.similar.map((item) => (
                <MediaCard key={item.id} {...item} />
              ))}
            </MediaCarousel>
          </SectionWrapper>
        )}
      </div>
    </div>
  );
}