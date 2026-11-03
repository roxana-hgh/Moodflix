import SectionContext from "@/components/layout/section-context";
import SectionWrapper from "@/components/layout/section-wrapper";
import { MediaCardWithActions } from "@/components/media/media-card-with-actions";
import { MediaCarousel } from "@/components/shared/media-carousel";
import type { MediaCardItem } from "@/types/media";

interface MediaRowProps {
  title: string;
  items: MediaCardItem[];
  seeMoreHref?: string;
  id?: string;
}

/** A titled carousel of poster cards, as used on the home page. */
export function MediaRow({ title, items, seeMoreHref, id }: MediaRowProps) {
  if (items.length === 0) return null;

  return (
    <SectionWrapper>
      <div className="max-w-6xl px-4 sm:px-6 mx-auto" id={id}>
        <SectionContext title={title} buttonText={seeMoreHref ? "See More" : undefined} ButtonLink={seeMoreHref} />
        <MediaCarousel itemsPerView={{ base: 2, sm: 3, md: 4, lg: 5, xl: 6 }} autoplay={false}>
          {items.map((item) => (
            <MediaCardWithActions key={`${item.mediaType}-${item.id}`} {...item} />
          ))}
        </MediaCarousel>
      </div>
    </SectionWrapper>
  );
}
