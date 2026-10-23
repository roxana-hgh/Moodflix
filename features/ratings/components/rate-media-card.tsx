"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Flame, Frown, Loader2, LogIn, Meh, Minus, Plus, Smile, Sparkles, ThumbsUp, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { tmdbImageUrl } from "@/utils/image";

import { deleteRating, upsertRating } from "../actions";
import type { UserRating } from "../types";
import { scoreLabel, scoreTone } from "@/features/ratings/rating-tone";
import SectionContext from "@/components/layout/SectionContext";

const STEP = 0.5;
const THUMB = 24; // px — must match the size-6 thumb classes below
const MAX_COMMENT = 2000;
const TICKS = Array.from({ length: 11 }, (_, i) => i);

// Thumb center travels from THUMB/2 to (100% - THUMB/2); this maps 0..1 onto that range
// so the fill, bubble and tick labels line up exactly with the native thumb.
const trackPos = (p: number) => `calc(${THUMB / 2}px + (100% - ${THUMB}px) * ${p})`;

const clampScore = (n: number) => Math.min(10, Math.max(0, Math.round(n / STEP) * STEP));

function ScoreIcon({ score, className }: { score: number | null; className?: string }) {
  if (score === null) return <Sparkles className={className} />;
  if (score < 2.5) return <Frown className={className} />;
  if (score < 5) return <Meh className={className} />;
  if (score < 7) return <Smile className={className} />;
  if (score < 9) return <ThumbsUp className={className} />;
  return <Flame className={className} />;
}

const thumbBase =
  "[&::-webkit-slider-thumb]:box-border [&::-webkit-slider-thumb]:size-6 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-[5px] [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-background [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-black/40 [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:active:scale-110 " +
  "[&::-moz-range-thumb]:box-border [&::-moz-range-thumb]:size-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-[5px] [&::-moz-range-thumb]:border-solid [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-background [&::-moz-range-thumb]:shadow-lg " +
  "[&::-webkit-slider-runnable-track]:h-6 [&::-webkit-slider-runnable-track]:bg-transparent [&::-moz-range-track]:h-6 [&::-moz-range-track]:bg-transparent " +
  "[&:focus-visible::-webkit-slider-thumb]:ring-4 [&:focus-visible::-webkit-slider-thumb]:ring-primary/40";

const nudgeButtonClass =
  "grid size-8 shrink-0 place-items-center rounded-full border border-white/10 bg-white/5 text-muted-foreground transition hover:bg-white/10 hover:text-foreground disabled:opacity-30";

interface RateMediaCardProps {
  tmdbId: number;
  mediaType: "MOVIE" | "TV";
  title: string;
  posterPath: string | null;
  releaseYear: string;
  isSignedIn: boolean;
  initialRating: UserRating | null;
}

export function RateMediaCard({
  tmdbId,
  mediaType,
  title,
  posterPath,
  releaseYear,
  isSignedIn,
  initialRating,
}: RateMediaCardProps) {
  const [score, setScore] = useState<number | null>(initialRating?.score ?? null);
  const [comment, setComment] = useState(initialRating?.comment ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const tone = scoreTone(score);

  const p = (score ?? 0) / 10;
  const hasExisting = initialRating !== null;
  const trimmed = comment.trim();
  const isDirty = score !== (initialRating?.score ?? null) || trimmed !== (initialRating?.comment ?? "");
  const submitLabel = hasExisting ? "Update" : trimmed ? "Post review" : "Save rating";

  const nudge = (delta: number) => setScore((prev) => clampScore((prev ?? 0) + delta));

  const handleSave = () => {
    if (score === null) return;
    setError(null);
    startTransition(async () => {
      const res = await upsertRating({ tmdbId, mediaType, score, comment: trimmed || null });
      if (!res.ok) setError(res.error);
    });
  };

  const handleRemove = () => {
    setError(null);
    startTransition(async () => {
      const res = await deleteRating({ tmdbId, mediaType });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setScore(null);
      setComment("");
    });
  };

  return (
    <>
      <SectionContext title={hasExisting ? "Your rating" : "Rate this"} />

      <div className="relative w-full">
        <div
          className={cn(
            "absolute -top-8 left-8 h-32 w-32 rounded-full opacity-60 blur-3xl transition-colors duration-500",
            tone.glow
          )}
        />

        <div className="relative overflow-hidden rounded-xl border border-white/5 bg-card/20 backdrop-blur-xl">
          {/* poster as a faint blurred ambient backdrop */}
          {posterPath && (
            <Image
              src={tmdbImageUrl(posterPath, "w500")}
              alt=""
              aria-hidden
              fill
              className="pointer-events-none scale-125 object-cover opacity-[0.06] blur-2xl"
            />
          )}

          <div className="relative grid gap-6 p-4 sm:p-5 md:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] md:gap-0">
            {/* LEFT — identity + score */}
            <div className="flex flex-col gap-4 md:border-r md:border-white/10 md:pr-6">
              <div className="flex items-center gap-3">
                <div className="relative aspect-[2/3] w-14 shrink-0 overflow-hidden rounded-md border border-white/10 bg-muted shadow-lg shadow-black/40">
                  {posterPath && (
                    <Image src={tmdbImageUrl(posterPath, "w500")} alt={title} fill sizes="44px" className="object-cover" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{title}</p>
                  <p className="text-xs text-muted-foreground">
                    {releaseYear || "TBA"} · {mediaType === "TV" ? "TV show" : "Movie"}
                  </p>
                </div>
              </div>

              <div className="flex items-end justify-between gap-3 md:flex-col md:items-start md:justify-start md:gap-3">
                <div
                  className={cn(
                    "text-5xl font-bold leading-none tabular-nums transition-colors duration-300",
                    tone.text
                  )}
                >
                  {score === null ? "–" : score.toFixed(1)}
                  <span className="ml-1 text-sm font-medium text-muted-foreground">/10</span>
                </div>

                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium transition-colors duration-300",
                    tone.text
                  )}
                >
                 <ScoreIcon score={score} className="size-3.5" />
                  {score === null ? "Slide to rate" : scoreLabel(score)}
                </span>
              </div>
            </div>

            {/* RIGHT — tracker */}
            <div className="flex flex-col justify-center md:pl-6">
              {!isSignedIn ? (
                <div className="flex flex-col items-start gap-3 rounded-lg border border-white/5 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground">Sign in to rate and review.</p>
                  <Button asChild size="sm" className="gap-1.5 rounded-full">
                    <Link href="/login">
                      <LogIn className="h-3.5 w-3.5" /> Sign in
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="pt-10">
                  <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3">
                    {/* row 1: buttons share the track's vertical center */}
                    <button
                      type="button"
                      aria-label="Decrease score by 0.5"
                      disabled={pending || score === null || score <= 0}
                      onClick={() => nudge(-STEP)}
                      className={nudgeButtonClass}
                    >
                      <Minus className="h-4 w-4" />
                    </button>

                    <div className="relative select-none">
                      {score !== null && (
                        <div
                          className="pointer-events-none absolute -top-9 -translate-x-1/2"
                          style={{ left: trackPos(p) }}
                        >
                          <div className="relative rounded-md bg-foreground px-2 py-1 text-xs font-bold tabular-nums text-background">
                            {score.toFixed(1)}
                            <div className="absolute left-1/2 top-full size-2 -translate-x-1/2 -translate-y-1 rotate-45 bg-foreground" />
                          </div>
                        </div>
                      )}

                      <div className="relative h-6">
                        <div className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-white/10" />
                        <div
                          className={cn(
                            "absolute left-0 top-1/2 h-2 -translate-y-1/2 rounded-full shadow-[0_0_16px] transition-[background-color,box-shadow] duration-300",
                            tone.fill,
                            tone.shadow,
                            score === null && "opacity-0"
                          )}
                          style={{ width: trackPos(p) }}
                        />
                        <input
                          type="range"
                          min={0}
                          max={10}
                          step={STEP}
                          value={score ?? 0}
                          disabled={pending}
                          aria-label="Your score out of 10"
                          onPointerDown={() => setScore((prev) => prev ?? 0)}
                          onChange={(e) => setScore(Number(e.target.value))}
                          className={cn(
                            "absolute inset-0 h-6 w-full cursor-pointer appearance-none bg-transparent focus-visible:outline-none disabled:cursor-not-allowed",
                            thumbBase
                          )}
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      aria-label="Increase score by 0.5"
                      disabled={pending || (score !== null && score >= 10)}
                      onClick={() => nudge(STEP)}
                      className={nudgeButtonClass}
                    >
                      <Plus className="h-4 w-4" />
                    </button>

                    {/* row 2: ticks live only under the track column */}
                    <div />
                    <div className="relative mt-2 h-4">
                      {TICKS.map((i) => (
                        <span
                          key={i}
                          className={cn(
                            "absolute top-0 -translate-x-1/2 text-[10px] tabular-nums",
                            i % 5 === 0 ? "text-muted-foreground" : "text-muted-foreground/40"
                          )}
                          style={{ left: trackPos(i / 10) }}
                        >
                          {i}
                        </span>
                      ))}
                    </div>
                    <div />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* BOTTOM — comment + actions, full width */}
          {isSignedIn && (
            <div className="relative px-4 pb-4 sm:px-5 sm:pb-5">
              {/* Comment box unlocks once a score exists (a comment requires a score). */}
              <div
                className={cn(
                  "grid transition-all duration-300 ease-out",
                  score === null ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100"
                )}
              >
                <div className="overflow-hidden">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value.slice(0, MAX_COMMENT))}
                    disabled={pending}
                    rows={3}
                    placeholder="Write a review (optional)…"
                    className="mt-1 w-full resize-none rounded-lg border border-white/10 bg-white/5 p-3 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus-visible:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                  />
                </div>
              </div>

              {error && <p className="mt-2 text-sm text-rose-400">{error}</p>}

              <div className="mt-3 flex items-center justify-between gap-3">
                {hasExisting ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={pending}
                    onClick={handleRemove}
                    className="gap-1.5 rounded-full text-muted-foreground hover:text-rose-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> <span className="text-xs">Remove</span>
                  </Button>
                ) : (
                  <span />
                )}

                <div className="flex items-center gap-3">
                  {score !== null && (
                    <span className="text-[11px] tabular-nums text-muted-foreground">
                      {comment.length}/{MAX_COMMENT}
                    </span>
                  )}
                  <Button
                    type="button"
                    size="sm"
                    disabled={pending || score === null || !isDirty}
                    onClick={handleSave}
                    className="min-w-28 gap-1.5 rounded-full"
                  >
                    {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    {submitLabel}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}