

import Image from "next/image";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { tmdbImageUrl } from "@/utils/image";
import { timeAgo } from "@/utils/format";
import type { ReviewCardItem } from "../types";
import { ReviewLikeButton } from "./review-like-button";

interface BulletColumnProps {
  title: string;
  items: string[];
  tone: "positive" | "negative";
}

function BulletColumn({ title, items, tone }: BulletColumnProps) {
  if (items.length === 0) return null;
  return (
    <div className="min-w-0">
      <p className="mb-1 text-xs font-semibold">{title}</p>
      <ul className="flex flex-col gap-0.5">
        {items.slice(0, 2).map((item, index) => (
          <li key={`${item}-${index}`} className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <span className={cn("mt-1.5 size-1 shrink-0 rounded-full", tone === "positive" ? "bg-primary" : "bg-destructive")} />
            <span className="line-clamp-1 break-words">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

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
    ? [first?.releaseYear, first?.mediaType === "MOVIE" ? "Movie" : "TV Show"].filter(Boolean).join(" · ")
    : `List · ${review.media.length}${review.media.length >= 4 ? "+" : ""} titles`;

  return (
    <article className="flex h-full flex-col gap-3 rounded-xl border bg-card p-3">
      {/* Media header */}
      <Link
        href={href}
        className="flex items-center gap-3 rounded-lg border bg-background/40 p-1.5 transition-colors hover:bg-accent/40"
      >
        <div className="flex shrink-0 -space-x-5">
          {posters.map((item) => (
            <div
              key={`${item.mediaType}-${item.tmdbId}`}
              className="relative h-16 w-11 overflow-hidden rounded border-2 border-card bg-muted"
            >
              {item.posterPath && (
                <Image src={tmdbImageUrl(item.posterPath)} alt={item.title} fill sizes="44px" className="object-cover" />
              )}
            </div>
          ))}
        </div>
        <div className={cn("min-w-0 flex-1", !isSingle && "pl-5")}>
          <p className="truncate font-heading text-sm font-semibold">{headerTitle}</p>
          <p className="truncate text-xs text-muted-foreground">{headerSubtitle}</p>
        </div>
        {review.overall !== null && (
          <div className="shrink-0 pr-1.5 text-right">
            <span className="font-heading text-xl font-bold text-primary">{review.overall}</span>
            <span className="text-[11px] text-muted-foreground">/10</span>
          </div>
        )}
      </Link>

      {/* Author */}
      <div className="flex items-center gap-2">
        <Avatar className="size-7">
          {review.author.avatarUrl && <AvatarImage src={review.author.avatarUrl} alt={review.author.name} />}
          <AvatarFallback className="text-xs">{review.author.name.slice(0, 1).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-sm font-medium">{review.author.name}</p>
          <p className="whitespace-nowrap text-[11px] text-muted-foreground">{timeAgo(review.publishedAt)}</p>
        </div>
        {review.status === "DRAFT" && (
          <Badge variant="secondary" className="px-2 py-0 text-[10px]">Draft</Badge>
        )}
        <Badge
          variant="outline"
          className={cn(
            "shrink-0 px-2 py-0 text-[10px]",
            review.hasSpoilers ? "border-destructive/50 text-destructive" : "border-primary/40 text-primary",
          )}
        >
          {review.hasSpoilers ? "Spoilers" : "Spoiler-free"}
        </Badge>
      </div>

      {/* Text */}
      <div className="flex flex-col gap-0.5">
        {isSingle && (
          <Link href={href} className="font-heading text-base font-semibold leading-snug hover:text-primary">
            {review.title}
          </Link>
        )}
        {review.excerpt && <p className="line-clamp-2 text-[13px] text-muted-foreground">{review.excerpt}</p>}
      </div>

      {(review.loved.length > 0 || review.disliked.length > 0) && (
        <div className="grid gap-2 sm:grid-cols-2">
          <BulletColumn title="What I loved" items={review.loved} tone="positive" />
          <BulletColumn title="What I didn't love" items={review.disliked} tone="negative" />
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto flex items-center gap-1 border-t pt-2">
        <ReviewLikeButton
          reviewId={review.id}
          initialLiked={review.likedByViewer}
          initialCount={review.likeCount}
          isAuthenticated={isAuthenticated}
        />
        <Link
          href={`${href}#comments`}
          className="flex items-center gap-1.5 px-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <MessageCircle className="size-4" />
          <span className="tabular-nums">{review.commentCount}</span>
        </Link>
   <Link href={href} className="ml-auto whitespace-nowrap text-xs font-medium text-primary hover:underline">
  Read review
</Link>
      </div>
    </article>
  );
}