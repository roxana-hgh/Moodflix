import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeleteReviewButton } from "@/features/reviews/components/delete-review-button";
import { ReviewComments } from "@/features/reviews/components/review-comments";
import { ReviewContent } from "@/features/reviews/components/review-content";
import { ReviewLikeButton } from "@/features/reviews/components/review-like-button";
import { ReviewRatingsPanel } from "@/features/reviews/components/review-ratings-panel";
import { getReviewBySlug, getReviewComments } from "@/features/reviews/queries";
import { mediaHref } from "@/features/reviews/types";
import { getCurrentUserId } from "@/lib/auth";
import { timeAgo } from "@/utils/format";
import { tmdbImageUrl } from "@/utils/image";
import { cn } from "@/lib/utils";


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
  const first = review.media[0];

  return (
    <div className="container mx-auto max-w-3xl py-6">
      <Link href="/reviews" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> All reviews
      </Link>

      <article className="flex flex-col gap-6">
        {/* Media */}
        {isSingle && first ? (
          <Link href={mediaHref(first)} className="flex items-center gap-4 rounded-2xl border bg-card p-3 transition-colors hover:bg-accent/40">
            <div className="relative h-28 w-20 shrink-0 overflow-hidden rounded-lg bg-muted sm:h-36 sm:w-24">
              {first.posterPath && (
                <Image src={tmdbImageUrl(first.posterPath, "w342")} alt={first.title} fill sizes="96px" className="object-cover" priority />
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate font-heading text-xl font-semibold">{first.title}</p>
              <p className="text-sm text-muted-foreground">
                {[first.releaseYear, first.mediaType === "MOVIE" ? "Movie" : "TV Show"].filter(Boolean).join(" · ")}
              </p>
            </div>
          </Link>
        ) : null}

        {/* Title + author */}
        <header className="flex flex-col gap-4">
          <h1 className="font-heading text-3xl font-bold leading-tight">{review.title}</h1>
          <div className="flex flex-wrap items-center gap-3">
            <Avatar className="size-10">
              {review.author.avatarUrl && <AvatarImage src={review.author.avatarUrl} alt={review.author.name} />}
              <AvatarFallback>{review.author.name.slice(0, 1).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{review.author.name}</p>
              <p className="text-xs text-muted-foreground">{timeAgo(review.publishedAt)}</p>
            </div>
            {review.status === "DRAFT" && <Badge variant="secondary">Draft</Badge>}
            <Badge variant="outline" className={cn(review.hasSpoilers ? "border-destructive/50 text-destructive" : "border-primary/40 text-primary")}>
              {review.hasSpoilers ? "Contains spoilers" : "Spoiler-free"}
            </Badge>
          </div>
        </header>

        {isSingle && <ReviewRatingsPanel ratings={review.ratings} />}

        {/* List posters */}
        {!isSingle && (
          <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {review.media.map((item, index) => (
              <li key={`${item.mediaType}-${item.tmdbId}`}>
                <Link href={mediaHref(item)} className="group flex flex-col gap-1.5">
                  <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-muted">
                    {item.posterPath && (
                      <Image src={tmdbImageUrl(item.posterPath, "w342")} alt={item.title} fill sizes="(min-width: 768px) 96px, 30vw" className="object-cover transition-transform group-hover:scale-105" />
                    )}
                    <span className="absolute left-1.5 top-1.5 rounded bg-background/80 px-1.5 text-xs font-semibold">{index + 1}</span>
                  </div>
                  <p className="line-clamp-2 text-xs font-medium">{item.title}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}

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
          <ReviewLikeButton reviewId={review.id} initialLiked={review.likedByViewer} initialCount={review.likeCount} isAuthenticated={viewerId !== null} />
          {isOwner && (
            <div className="ml-auto flex items-center gap-2">
              <Button asChild variant="outline" size="sm" className="gap-1.5">
                <Link href={`/reviews/${review.slug}/edit`}>
                  <Pencil className="size-4" /> Edit
                </Link>
              </Button>
              <DeleteReviewButton reviewId={review.id} />
            </div>
          )}
        </div>

        {review.status === "PUBLISHED" && (
          <ReviewComments reviewId={review.id} reviewOwnerId={review.author.id} comments={comments} totalCount={review.commentCount} viewerId={viewerId} />
        )}
      </article>
    </div>
  );
}