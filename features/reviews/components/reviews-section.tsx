import Link from "next/link";
import { PenLine } from "lucide-react";
import SectionContext from "@/components/layout/SectionContext";
import SectionWrapper from "@/components/layout/SectionWrapper";
import { MediaCarousel } from "@/components/shared/Slider/media-carousel";
import { Button } from "@/components/ui/button";
import type { ReviewCardItem } from "../types";
import { ReviewCard } from "./review-card";

interface ReviewsSectionProps {
  title: string;
  seeAllHref: string;
  reviews: ReviewCardItem[];
  isAuthenticated: boolean;
  emptyText: string;
  createHref?: string;
}

export function ReviewsSection({
  title,
  seeAllHref,
  reviews,
  isAuthenticated,
  emptyText,
  createHref,
}: ReviewsSectionProps) {
  const createButton = createHref ? (
    <Button asChild size="sm" className="gap-1.5">
      <Link href={createHref}>
        <PenLine className="size-4" /> Write a review
      </Link>
    </Button>
  ) : null;

  return (
    <SectionWrapper>
      <div className="mx-auto">
        <SectionContext title={title} buttonText="See all" ButtonLink={seeAllHref} />

        {reviews.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-3 text-center">
            <p className="text-sm text-muted-foreground">{emptyText}</p>
            {createButton}
          </div>
        ) : (
          <>
            {createButton && <div className="mb-3 flex justify-end">{createButton}</div>}
            <MediaCarousel
              itemsPerView={{ base: 1, sm: 1, md: 2, lg: 3, xl: 3 }}
              autoplay={false}
            >
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} isAuthenticated={isAuthenticated} />
              ))}
            </MediaCarousel>
          </>
        )}
      </div>
    </SectionWrapper>
  );
}