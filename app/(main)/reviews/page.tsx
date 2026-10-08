import type { Metadata } from "next";
import Link from "next/link";
import { PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReviewCard } from "@/features/reviews/components/review-card";
import { getReviewsFeed } from "@/features/reviews/queries";
import { getCurrentUserId } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Reviews | Moodflix",
  description: "Read what the community thinks about movies and TV shows.",
};

interface ReviewsPageProps {
  searchParams: Promise<{ page?: string; tmdbId?: string; type?: string }>;
}

export default async function ReviewsPage({ searchParams }: ReviewsPageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const tmdbId = Number.parseInt(params.tmdbId ?? "", 10) || undefined;
  const mediaType = params.type === "MOVIE" || params.type === "TV" ? params.type : undefined;

  const viewerId = await getCurrentUserId();
  const { items, total, totalPages } = await getReviewsFeed({ page, tmdbId, mediaType, viewerId });

  const pageHref = (target: number) => {
    const search = new URLSearchParams();
    if (target > 1) search.set("page", String(target));
    if (tmdbId && mediaType) {
      search.set("tmdbId", String(tmdbId));
      search.set("type", mediaType);
    }
    const query = search.toString();
    return query ? `/reviews?${query}` : "/reviews";
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold">Reviews</h1>
          <p className="text-sm text-muted-foreground">{total} reviews from the community</p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/reviews/new">
            <PenLine className="size-4" /> Write a review
          </Link>
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">No reviews yet. Be the first to write one!</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((review) => (
            <ReviewCard key={review.id} review={review} isAuthenticated={viewerId !== null} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <nav className="mt-8 flex items-center justify-center gap-3" aria-label="Pagination">
          {page > 1 && (
            <Button asChild variant="outline">
              <Link href={pageHref(page - 1)}>Previous</Link>
            </Button>
          )}
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          {page < totalPages && (
            <Button asChild variant="outline">
              <Link href={pageHref(page + 1)}>Next</Link>
            </Button>
          )}
        </nav>
      )}
    </div>
  );
}