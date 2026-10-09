import Image from "next/image";
import Link from "next/link";
import { ChevronRight, MessageCircle, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { timeAgo } from "@/utils/format";
import { tmdbImageUrl } from "@/utils/image";
import { mediaHref, type ReviewCardItem } from "../types";
import { ReviewLikeButton } from "./review-like-button";

interface ReviewCardProps {
  review: ReviewCardItem;
  isAuthenticated: boolean;
}

export function ReviewCard({ review, isAuthenticated }: ReviewCardProps) {
  const href = `/reviews/${review.slug}`;
  const isSingle = review.type === "SINGLE";
  const first = review.media[0];
  const posters = isSingle ? review.media.slice(0, 1) : review.media.slice(0, 3);

  const headerTitle = isSingle ? (first?.title ?? review.title) : review.title;
  const headerSubtitle = isSingle
    ? [first?.releaseYear, first?.mediaType === "MOVIE" ? "Movie" : "TV Show"]
        .filter(Boolean)
        .join(" · ")
    : `List · ${review.media.length}${review.media.length >= 4 ? "+" : ""} titles`;

  const headerContent = (
    <>
      <div className="flex shrink-0 -space-x-6">
        {posters.map((item) => (
          <div
            key={`${item.mediaType}-${item.tmdbId}`}
            className="relative aspect-[2/3] w-12 overflow-hidden rounded-md border-2 border-card bg-muted shadow-sm sm:w-14"
          >
            {item.posterPath && (
              <Image
                src={tmdbImageUrl(item.posterPath)}
                alt={item.title}
                fill
                sizes="56px"
                className="object-cover"
              />
            )}
          </div>
        ))}
      </div>
      <div className={cn("min-w-0 flex-1 gap-1 pt-2", !isSingle && "pl-1")}>
        <p className="line-clamp-2 font-heading text-[15px] font-semibold leading-tight transition-colors group-hover/media:text-primary">
          {headerTitle}
        </p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{headerSubtitle}</p>
      </div>
    </>
  );

  return (
    <article className="relative flex h-full flex-col gap-3.5 rounded-2xl border bg-card p-4 transition-colors hover:border-primary/30">
      {/* Media header + score */}
      <div className="flex items-start gap-3">
        {isSingle && first ? (
          <Link
            href={mediaHref(first)}
            className="group/media relative z-10 flex min-w-0 flex-1 items-start gap-3"
          >
            {headerContent}
          </Link>
        ) : (
          <div className="flex min-w-0 flex-1 items-start gap-3">{headerContent}</div>
        )}

        {review.overall !== null && (
          <div
            className="flex shrink-0 items-center gap-1 pt-1 text-sm"
            aria-label={`Rated ${review.overall} out of 10`}
          >
            <Star className="size-3.5 fill-primary text-primary" />
            <span className="font-medium tabular-nums">{review.overall}</span>
            <span className="text-xs text-muted-foreground">/10</span>
          </div>
        )}
      </div>

      {/* Author */}
      <div className="flex items-center gap-2">
        <Avatar className="size-7">
          {review.author.avatarUrl && (
            <AvatarImage src={review.author.avatarUrl} alt={review.author.name} />
          )}
          <AvatarFallback className="text-[11px]">
            {review.author.name.slice(0, 1).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-xs font-medium">{review.author.name}</p>
          <p className="whitespace-nowrap text-[11px] text-muted-foreground">
            {timeAgo(review.publishedAt)}
          </p>
        </div>
        {review.status === "DRAFT" && (
          <Badge variant="secondary" className="shrink-0 px-2 py-0 text-[10px]">
            Draft
          </Badge>
        )}
        <Badge
          variant="outline"
          className={cn(
            "shrink-0 rounded-full px-2 py-0 text-[10px]",
            review.hasSpoilers
              ? "border-destructive/40 text-destructive"
              : "border-primary/40 text-primary",
          )}
        >
          {review.hasSpoilers ? "Spoilers" : "Spoiler-free"}
        </Badge>
      </div>

      {/* Title + excerpt (title link stretches over the whole card) */}
      <div className="flex flex-col gap-1.5">
        {isSingle && (
          <h3 className="font-heading text-base font-medium leading-snug">
            <Link href={href} className="after:absolute after:inset-0 after:content-['']">
              {review.title}
            </Link>
          </h3>
        )}
        {review.excerpt && (
          <p className="line-clamp-4 text-[13px] leading-relaxed text-muted-foreground">
            {review.excerpt}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="relative z-10 mt-auto flex items-center gap-1 border-t pt-2.5">
        <ReviewLikeButton
          reviewId={review.id}
          initialLiked={review.likedByViewer}
          initialCount={review.likeCount}
          isAuthenticated={isAuthenticated}
        />
        <Link
          href={`${href}#comments`}
          className="flex items-center gap-1.5 px-2 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <MessageCircle className="size-4" />
          <span className="tabular-nums">{review.commentCount}</span>
        </Link>
        <Link
          href={href}
          className="group/read ml-auto flex items-center gap-0.5 whitespace-nowrap text-xs text-muted-foreground transition-colors hover:text-primary"
        >
          Read review
          <ChevronRight className="size-3.5 transition-transform group-hover/read:translate-x-0.5" />
        </Link>
      </div>
    </article>
  );
}