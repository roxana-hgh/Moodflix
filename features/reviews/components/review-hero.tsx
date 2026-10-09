import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { timeAgo } from "@/utils/format";
import { tmdbImageUrl } from "@/utils/image";
import { mediaHref, type ReviewDetail } from "../types";

export function ReviewHero({ review }: { review: ReviewDetail }) {
  const isSingle = review.type === "SINGLE";
  const first = review.media[0];
  const posters = isSingle ? review.media.slice(0, 1) : review.media.slice(0, 3);

  const kicker =
    isSingle && first
      ? [first.title, first.releaseYear, first.mediaType === "MOVIE" ? "Movie" : "TV Show"]
          .filter(Boolean)
          .join(" · ")
      : `List · ${review.media.length} titles`;

  const kickerClass = "truncate text-xs font-semibold uppercase tracking-wider text-primary";

  return (
    <header className="relative isolate overflow-hidden rounded-2xl border bg-card">
      {/* Blurred poster backdrop */}
      {first?.posterPath && (
        <>
          <Image
            src={tmdbImageUrl(first.posterPath)}
            alt=""
            aria-hidden
            fill
            sizes="100px"
            className="-z-10 scale-125 object-cover opacity-25 blur-2xl"
          />
          <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-card via-card/70 to-card/30" />
        </>
      )}

      <div className="flex items-start gap-4 p-4 sm:items-center sm:gap-6 sm:p-5">
        {/* Posters */}
        <div className="flex shrink-0 -space-x-6 sm:-space-x-8">
          {posters.map((item) => (
            <Link
              key={`${item.mediaType}-${item.tmdbId}`}
              href={mediaHref(item)}
              aria-label={item.title}
              className={cn(
                "relative aspect-[2/3] overflow-hidden rounded-lg border-2 border-card bg-muted shadow-lg",
                isSingle ? "w-20 sm:w-28" : "w-14 sm:w-20",
              )}
            >
              {item.posterPath && (
                <Image
                  src={tmdbImageUrl(item.posterPath)}
                  alt={item.title}
                  fill
                  sizes="112px"
                  className="object-cover"
                  priority={item === first}
                />
              )}
            </Link>
          ))}
        </div>

        {/* Text */}
        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:gap-3">
          {isSingle && first ? (
            <Link href={mediaHref(first)} className={cn(kickerClass, "hover:underline")}>
              {kicker}
            </Link>
          ) : (
            <p className={kickerClass}>{kicker}</p>
          )}

          <h1 className="text-balance font-heading text-xl font-bold leading-tight sm:text-2xl">
            {review.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <Avatar className="size-5">
                {review.author.avatarUrl && (
                  <AvatarImage src={review.author.avatarUrl} alt={review.author.name} />
                )}
                <AvatarFallback className="text-[10px]">
                  {review.author.name.slice(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="truncate block  text-sm font-medium">{review.author.name}</span>
              <span className="shrink-0 block text-xs text-muted-foreground pt-1">· {timeAgo(review.publishedAt)}</span>
            </div>

            <div className="flex items-center gap-2 pt-1">
              {review.status === "DRAFT" && (
                <Badge variant="secondary" className="px-2 py-0 text-[11px]">Draft</Badge>
              )}
              <Badge
                variant="outline"
                className={cn(
                  "px-2 py-0 text-[11px]",
                  review.hasSpoilers
                    ? "border-destructive/50 text-destructive"
                    : "border-primary/40 text-primary",
                )}
              >
                {review.hasSpoilers ? "Contains spoilers" : "Spoiler-free"}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}