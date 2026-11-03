"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import SectionContext from "@/components/layout/section-context";
import { scoreTone } from "@/features/ratings/rating-tone";
import type { Review } from "../types";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 4;
const SEGMENTS = Array.from({ length: 10 }, (_, i) => i + 1);
const FADE_MASK = "linear-gradient(to bottom, black 60%, transparent 100%)";

/** Compact read-only version of the rating meter in RateMediaCard. */
function ScoreMeter({ rating }: { rating: number }) {
  const tone = scoreTone(rating);

  return (
    <div className="flex shrink-0 items-center gap-2.5" aria-label={`Rated ${rating.toFixed(1)} out of 10`}>
      <div className="hidden gap-0.5 sm:flex" aria-hidden>
        {SEGMENTS.map((n) => {
          const fill = Math.min(1, Math.max(0, rating - (n - 1)));
          return (
            <span key={n} className="relative h-3 w-1.5 overflow-hidden rounded-[2px] bg-white/8">
              <span className={cn("absolute inset-y-0 left-0", tone.fill)} style={{ width: `${fill * 100}%` }} />
            </span>
          );
        })}
      </div>
      <span className={cn("text-sm font-semibold tabular-nums", tone.text)}>{rating.toFixed(1)}</span>
    </div>
  );
}

function ReviewItem({ review }: { review: Review }) {
  const [expanded, setExpanded] = useState(false);
  const [isClamped, setIsClamped] = useState(false);
  const contentRef = useRef<HTMLParagraphElement>(null);

  // Measure actual overflow; clamp height depends on width and font, not string length.
  useEffect(() => {
    const el = contentRef.current;
    if (!el || expanded) return;

    const checkOverflow = () => setIsClamped(el.scrollHeight - el.clientHeight > 1);
    checkOverflow();

    const observer = new ResizeObserver(checkOverflow);
    observer.observe(el);
    return () => observer.disconnect();
  }, [expanded, review.content]);

  return (
    <article className="flex gap-3 px-4 py-5 sm:gap-4 sm:px-6">
      <Avatar className="size-9 shrink-0">
        <AvatarImage src={review.avatarUrl ?? undefined} alt={review.author} />
        <AvatarFallback className="bg-white/6 text-xs font-medium">
          {review.author.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <header className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-medium text-foreground">{review.author}</span>
              {review.source === "moodflix" && (
                <span className="shrink-0 rounded-full bg-primary/10 px-1.5 py-px text-[10px] font-medium text-primary">
                  Moodflix
                </span>
              )}
            </div>
            <p className="mt-0.5 truncate text-xs text-muted-foreground/70">
              {review.username ? `@${review.username} · ` : ""}
              {review.createdAtLabel}
              {review.source === "tmdb" && " · via TMDB"}
            </p>
          </div>

          {review.rating !== null && <ScoreMeter rating={review.rating} />}
        </header>

        <p
          ref={contentRef}
          className={cn(
            "mt-3 whitespace-pre-line text-sm leading-relaxed text-foreground/80",
            !expanded && "line-clamp-4"
          )}
          style={!expanded && isClamped ? { maskImage: FADE_MASK, WebkitMaskImage: FADE_MASK } : undefined}
        >
          {review.content}
        </p>

        {(isClamped || expanded) && (
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="mt-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        )}
      </div>
    </article>
  );
}

export function ReviewsSection({ reviews }: { reviews: Review[] }) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  if (reviews.length === 0) return null;

  const visibleReviews = reviews.slice(0, visibleCount);
  const remaining = reviews.length - visibleCount;

  return (
    <>
      <SectionContext title={`Reviews · ${reviews.length}`} />

      <div className="w-full overflow-hidden rounded-2xl border border-white/6 bg-card/30">
        <div className="divide-y divide-white/6">
          {visibleReviews.map((review) => (
            <ReviewItem key={review.id} review={review} />
          ))}
        </div>

        {remaining > 0 && (
          <button
            type="button"
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            className="flex w-full items-center justify-center gap-1.5 border-t border-white/6 py-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-white/3 hover:text-foreground"
          >
            Show {Math.min(remaining, PAGE_SIZE)} more
            <ChevronDown className="size-3.5" />
          </button>
        )}
      </div>
    </>
  );
}
