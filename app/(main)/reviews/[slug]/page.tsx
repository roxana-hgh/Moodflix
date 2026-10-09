import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteReviewButton } from "@/features/reviews/components/delete-review-button";
import { ReviewComments } from "@/features/reviews/components/review-comments";
import { ReviewContent } from "@/features/reviews/components/review-content";
import { ReviewHero } from "@/features/reviews/components/review-hero";
import { ReviewLikeButton } from "@/features/reviews/components/review-like-button";
import { ReviewRatingsPanel } from "@/features/reviews/components/review-ratings-panel";
import { ReviewTitlesPanel } from "@/features/reviews/components/review-titles-panel";
import { getReviewBySlug, getReviewComments } from "@/features/reviews/queries";
import { getCurrentUserId } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { tmdbImageUrl } from "@/utils/image";

interface ReviewPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ReviewPageProps): Promise<Metadata> {
  const { slug } = await params;
  const viewerId = await getCurrentUserId();
  const review = await getReviewBySlug(slug, viewerId);
  if (!review) return { title: "Review not found | Moodflix" };

  const poster = review.media[0]?.posterPath;
  const image = review.coverUrl ?? (poster ? tmdbImageUrl(poster, "w500") : undefined);

  return {
    title: `${review.title} | Moodflix`,
    description: review.excerpt ?? undefined,
    openGraph: {
      title: review.title,
      description: review.excerpt ?? undefined,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ReviewPage({ params }: ReviewPageProps) {
  const { slug } = await params;
  const viewerId = await getCurrentUserId();
  const review = await getReviewBySlug(slug, viewerId);
  if (!review) notFound();

  const comments = await getReviewComments(review.id);
  const isOwner = viewerId === review.author.id;
  const isSingle = review.type === "SINGLE";
  const hasSidebar = isSingle ? Object.values(review.ratings).some((v) => v !== null) : true;

  return (
    <div className="container mx-auto max-w-6xl py-6">
      <Link
        href="/reviews"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> All reviews
      </Link>

      <article className="flex flex-col gap-6">
        <ReviewHero review={review} />

        <div
          className={cn(
            "grid gap-6 lg:items-start lg:gap-10",
            hasSidebar && "lg:grid-cols-[minmax(0,1fr)_300px]",
          )}
        >
          {/* Main column */}
          <div className="flex min-w-0 flex-col gap-6">
            <ReviewContent content={review.content} />

            {(review.loved.length > 0 || review.disliked.length > 0) && (
              <div className="grid gap-4 rounded-2xl border bg-card p-4 sm:grid-cols-2">
                {[
                  { title: "What I loved", items: review.loved, dot: "bg-primary" },
                  { title: "What I didn't love", items: review.disliked, dot: "bg-destructive" },
                ].map(
                  (column) =>
                    column.items.length > 0 && (
                      <div key={column.title}>
                        <h2 className="mb-2 text-sm font-semibold">{column.title}</h2>
                        <ul className="flex flex-col gap-1.5">
                          {column.items.map((item, index) => (
                            <li key={`${item}-${index}`} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <span className={cn("mt-2 size-1.5 shrink-0 rounded-full", column.dot)} />
                              <span className="break-words">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ),
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2 border-y py-2">
              <ReviewLikeButton
                reviewId={review.id}
                initialLiked={review.likedByViewer}
                initialCount={review.likeCount}
                isAuthenticated={viewerId !== null}
              />
              {isOwner && (
                <div className="ml-auto flex items-center gap-0.5">
                  <Button asChild variant="ghost" size="sm" className="gap-1 ">
                    <Link href={`/reviews/${review.slug}/edit`}>
                      <Pencil className="size-3.5" /> <span className="text-xs">Edit</span>
                    </Link>
                  </Button>
                  <DeleteReviewButton reviewId={review.id} />
                </div>
              )}
            </div>

            {review.status === "PUBLISHED" && (
              <ReviewComments
                reviewId={review.id}
                reviewOwnerId={review.author.id}
                comments={comments}
                totalCount={review.commentCount}
                viewerId={viewerId}
              />
            )}
          </div>

          {/* Sidebar: first on mobile, sticky on the right on desktop */}
          {hasSidebar && (
            <aside className="order-first lg:sticky lg:top-20 lg:order-none">
              {isSingle ? (
                <ReviewRatingsPanel ratings={review.ratings} />
              ) : (
                <ReviewTitlesPanel media={review.media} />
              )}
            </aside>
          )}
        </div>
      </article>
    </div>
  );
}