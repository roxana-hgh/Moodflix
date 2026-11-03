"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { ArrowUp, Loader2, LogIn, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { deleteRating, upsertRating } from "../actions";
import type { UserRating } from "../types";
import { scoreLabel, scoreTone } from "@/features/ratings/rating-tone";
import SectionContext from "@/components/layout/section-context";

const STEP = 0.5;
const MAX_COMMENT = 2000;
const SEGMENTS = Array.from({ length: 10 }, (_, i) => i + 1);

const clampScore = (n: number) => Math.min(10, Math.max(0, Math.round(n / STEP) * STEP));

interface RateMediaCardProps {
  tmdbId: number;
  mediaType: "MOVIE" | "TV";
  title: string;
  isSignedIn: boolean;
  initialRating: UserRating | null;
}

export function RateMediaCard({ tmdbId, mediaType, title, isSignedIn, initialRating }: RateMediaCardProps) {
  const [score, setScore] = useState<number | null>(initialRating?.score ?? null);
  const [hover, setHover] = useState<number | null>(null);
  const [comment, setComment] = useState(initialRating?.comment ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const meterRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  // While hovering the meter, preview the score under the pointer.
  const shown = hover ?? score;
  const tone = scoreTone(shown);
  const isPreview = hover !== null && hover !== score;

  const hasExisting = initialRating !== null;
  const trimmed = comment.trim();
  const isDirty = score !== (initialRating?.score ?? null) || trimmed !== (initialRating?.comment ?? "");
  const submitLabel = hasExisting ? "Update" : trimmed ? "Post" : "Save";
  const canSave = !pending && score !== null && isDirty;
  const interactive = isSignedIn && !pending;

  // Pointer x → score in half steps. Any touch inside a segment counts, so the minimum tap is 0.5.
  const scoreAt = (clientX: number) => {
    const rect = meterRef.current!.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    return Math.max(STEP, Math.ceil(ratio * 20) / 2);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!interactive) return;
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    setScore(scoreAt(e.clientX));
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!interactive) return;
    const next = scoreAt(e.clientX);
    if (dragging.current) setScore(next);
    else if (e.pointerType === "mouse") setHover(next);
  };

  const handlePointerUp = () => {
    dragging.current = false;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!interactive) return;
    const current = score ?? 0;
    let next: number | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") next = current + STEP;
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") next = current - STEP;
    else if (e.key === "PageUp") next = current + 1;
    else if (e.key === "PageDown") next = current - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = 10;
    else if (/^[0-9]$/.test(e.key)) next = e.key === "0" ? 10 : Number(e.key);
    if (next === null) return;
    e.preventDefault();
    setScore(clampScore(next));
  };

  const handleSave = () => {
    if (!canSave || score === null) return;
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

      <div className="w-full rounded-2xl border border-white/6 bg-card/30 p-4 sm:p-6">
        {/* Score readout */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-baseline gap-3">
            <span
              className={cn(
                "text-5xl font-semibold leading-none tracking-tight tabular-nums transition-colors duration-300 sm:text-6xl",
                shown === null ? "text-muted-foreground/30" : tone.text,
                isPreview && "opacity-60"
              )}
            >
              {shown === null ? "0.0" : shown.toFixed(1)}
            </span>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground/60">/ 10</span>
              <span
                className={cn(
                  "text-sm font-medium transition-colors duration-300",
                  shown === null ? "text-muted-foreground" : "text-foreground"
                )}
              >
                {shown === null ? (isSignedIn ? "Tap to rate" : "Not rated") : scoreLabel(shown)}
              </span>
            </div>
          </div>

          {hasExisting && (
            <button
              type="button"
              disabled={pending}
              onClick={handleRemove}
              aria-label="Remove rating"
              className="grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground/70 transition hover:bg-rose-500/10 hover:text-rose-400 disabled:opacity-40"
            >
              <Trash2 className="size-4" />
            </button>
          )}
        </div>

        {/* Segmented meter */}
        <div className="mt-6">
          <div
            ref={meterRef}
            role="slider"
            tabIndex={interactive ? 0 : -1}
            aria-label={`Rate ${title} out of 10`}
            aria-valuemin={0}
            aria-valuemax={10}
            aria-valuenow={score ?? 0}
            aria-valuetext={score === null ? "Not rated" : `${score.toFixed(1)}, ${scoreLabel(score)}`}
            aria-disabled={!interactive}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onPointerLeave={() => setHover(null)}
            onKeyDown={handleKeyDown}
            className={cn(
              "group flex touch-none select-none gap-1 rounded-lg outline-none sm:gap-1.5",
              "focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-4 focus-visible:ring-offset-background",
              interactive ? "cursor-pointer" : "cursor-not-allowed opacity-50"
            )}
          >
            {SEGMENTS.map((n) => {
              const fill = shown === null ? 0 : Math.min(1, Math.max(0, shown - (n - 1)));
              return (
                <div
                  key={n}
                  className="relative h-9 flex-1 overflow-hidden rounded-md bg-white/6 transition-transform duration-150 sm:h-10"
                >
                  <div
                    className={cn(
                      "absolute inset-y-0 left-0 transition-[width,background-color,opacity] duration-200 ease-out",
                      tone.fill,
                      isPreview && "opacity-50"
                    )}
                    style={{ width: `${fill * 100}%` }}
                  />
                </div>
              );
            })}
          </div>

          <div className="mt-2 flex gap-1 sm:gap-1.5" aria-hidden>
            {SEGMENTS.map((n) => (
              <span
                key={n}
                className={cn(
                  "flex-1 text-center text-[10px] tabular-nums transition-colors",
                  shown !== null && n <= Math.ceil(shown) ? "text-muted-foreground" : "text-muted-foreground/30"
                )}
              >
                {n}
              </span>
            ))}
          </div>
        </div>

        {!isSignedIn && (
          <div className="mt-6 flex items-center justify-between gap-3 border-t border-white/6 pt-4">
            <p className="text-sm text-muted-foreground">Sign in to rate and review.</p>
            <Button asChild size="sm" variant="secondary" className="gap-1.5 rounded-full">
              <Link href="/login">
                <LogIn className="size-3.5" /> Sign in
              </Link>
            </Button>
          </div>
        )}

        {/* Composer unlocks once a score exists (a comment requires a score). */}
        {isSignedIn && (
          <div
            className={cn(
              "grid transition-all duration-300 ease-out",
              score === null ? "grid-rows-[0fr] opacity-0" : "mt-6 grid-rows-[1fr] opacity-100"
            )}
          >
            <div className="overflow-hidden">
              <div className="rounded-xl border border-white/8 bg-white/3 transition-colors focus-within:border-white/20 focus-within:bg-white/5">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value.slice(0, MAX_COMMENT))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault();
                      handleSave();
                    }
                  }}
                  disabled={pending || score === null}
                  rows={3}
                  placeholder="What did you think? (optional)"
                  className="block w-full resize-none bg-transparent px-4 pt-3 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/50 focus-visible:outline-none"
                />
                <div className="flex items-center justify-between gap-3 px-3 pb-3 pt-1">
                  <span
                    className={cn(
                      "pl-1 text-[11px] tabular-nums transition-colors",
                      comment.length > MAX_COMMENT * 0.9 ? "text-amber-400" : "text-muted-foreground/50"
                    )}
                  >
                    {comment.length > 0 ? `${comment.length}/${MAX_COMMENT}` : ""}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    disabled={!canSave}
                    onClick={handleSave}
                    className="h-8 gap-1.5 rounded-full px-4"
                  >
                    {pending ? <Loader2 className="size-3.5 animate-spin" /> : <ArrowUp className="size-3.5" />}
                    {submitLabel}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && <p className="mt-3 text-sm text-rose-400">{error}</p>}
      </div>
    </>
  );
}
