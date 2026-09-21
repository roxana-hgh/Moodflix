"use client";

import { useState } from "react";
import { Quote, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { Review } from "../types";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 3;
const CLAMP_THRESHOLD = 158;

// Static class maps only — no dynamic class-string construction (Tailwind JIT purges those).
const TONE = {
    high: { glow: "bg-emerald-500/20", ring: "ring-emerald-500/40", text: "text-emerald-400", star: "text-emerald-400" },
    mid: { glow: "bg-amber-500/20", ring: "ring-amber-500/40", text: "text-amber-400", star: "text-amber-400" },
    low: { glow: "bg-rose-500/20", ring: "ring-rose-500/40", text: "text-rose-400", star: "text-rose-400" },
    neutral: { glow: "bg-primary/15", ring: "ring-border", text: "text-muted-foreground", star: "text-primary" },
} as const;

function toneFor(rating: number | null) {
    if (rating === null) return TONE.neutral;
    if (rating >= 7.5) return TONE.high;
    if (rating >= 5) return TONE.mid;
    return TONE.low;
}

function StarRow({
    rating,
    starClass,
}: {
    rating: number;
    starClass: string;
}) {
    const stars = Math.max(0, Math.min(5, rating / 2));

    return (
        <div className="relative inline-flex">
            <div className="flex gap-0.5 text-muted-foreground/20">
                {Array.from({ length: 5 }).map((_, i) => {
                    const fillPercentage = Math.max(
                        0,
                        Math.min(100, (stars - i) * 100)
                    );

                    return (
                        <div key={i} className="relative size-3.5 sm:size-4">
                            {/* Empty star */}
                            <Star className="absolute size-3.5 sm:size-4 fill-current" />

                            {/* Filled part */}
                            <div
                                className="absolute inset-0 overflow-hidden"
                                style={{ width: `${fillPercentage}%` }}
                            >
                                <Star
                                    className={cn("size-3.5 sm:size-4 fill-current", starClass)}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
function ReviewCard({ review }: { review: Review }) {
    const [expanded, setExpanded] = useState(false);
    const isLong = review.content.length > CLAMP_THRESHOLD;
    const tone = toneFor(review.rating);

    return (
        <div className="group relative">
            {/* ambient glow behind the card */}
            <div
                className={cn(
                    "absolute -top-6 right-6 h-28 w-28 rounded-full blur-3xl transition-opacity duration-300 group-hover:opacity-100",
                    tone.glow,
                    "opacity-60"
                )}
            />

            <div
                className={cn(
                    "relative flex h-full flex-col overflow-hidden rounded-lg border border-white/5 bg-card/20 p-5",
                    "backdrop-blur-xl transition-all duration-300",
                    " hover:border-white/10 hover:shadow-2xl hover:shadow-black/20"
                )}
            >
                {/* <Quote
          className="pointer-events-none absolute -left-1 -top-1 h-14 w-14 text-foreground/[0.04]"
          strokeWidth={0}
          fill="currentColor"
        /> */}

                <div className="relative flex items-center justify-between gap-3">
                    {review.rating !== null ? (
                        <StarRow rating={review.rating} starClass={tone.star} />
                    ) : (
                        <span className="text-xs font-medium text-muted-foreground">Review</span>
                    )}

                    {review.rating !== null && (
                        <span
                            className={cn(
                                "shrink-0 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold backdrop-blur-sm",
                                tone.text
                            )}
                        >
                            {review.rating.toFixed(1)}
                            <span className="text-muted-foreground">/10</span>
                        </span>
                    )}
                </div>

                <div className="relative mt-4 flex-1">
                    <p
                        className={cn(
                            "whitespace-pre-line text-sm leading-relaxed text-foreground/80",
                            !expanded && isLong && "line-clamp-3"
                        )}
                    >
                        {review.content}
                    </p>
                    {isLong && !expanded && (
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-5 bg-linear-to-t from-card/30 to-transparent" />
                    )}
                </div>

                {isLong && (
                    <button
                        onClick={() => setExpanded((e) => !e)}
                        className={cn("relative mt-2 self-start text-xs font-semibold hover:opacity-80", tone.text)}
                    >
                        {expanded ? "Show less" : "Read more"}
                    </button>
                )}

                <div className="relative mt-5 flex items-center gap-3 border-t border-white/10 pt-4">
                    <Avatar className={cn("size-7 sm:size-8 ring-2 ring-offset-2 ring-offset-card", tone.ring)}>
                        <AvatarImage src={review.avatarUrl ?? undefined} alt={review.author} />
                        <AvatarFallback className="text-xs font-medium">
                            {review.author.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex min-w-0 gap-0.5 flex-col">
                        <span className="truncate text-xs sm:text-sm font-semibold text-foreground">{review.author}</span>
                        <span className="truncate text-xs text-muted-foreground mt-px">
                            {review.username ? `@${review.username} · ` : ""}
                            {review.createdAtLabel}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function ReviewsSection({ reviews }: { reviews: Review[] }) {
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

    if (reviews.length === 0) return null;

    const visibleReviews = reviews.slice(0, visibleCount);
    const remaining = reviews.length - visibleCount;

    return (
        <div className="">
            <h2 className="mb-4 text-sm font-semibold text-primary p-1">
                Reviews
            </h2>
            <div className="flex flex-col gap-6">

                <div className="grid gap-5 ">
                    {visibleReviews.map((review) => (
                        <ReviewCard key={review.id} review={review} />
                    ))}
                </div>

                {remaining > 0 && (
                    <Button
                        variant="outline"
                        onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                        size="sm"
                        className="mx-auto rounded-full border-white/10 bg-white/5 px-5  backdrop-blur-sm hover:bg-white/10"
                    >
                        <span className="text-xs"> View {Math.min(remaining, PAGE_SIZE)} more reviews</span>
                    </Button>
                )}
            </div>
        </div>

    );
}