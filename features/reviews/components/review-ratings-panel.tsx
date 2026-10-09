import { RATING_CRITERIA } from "../schema";
import type { ReviewRatings } from "../types";

const RING_RADIUS = 30;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

function scoreLabel(score: number): string {
  if (score >= 9) return "Masterpiece";
  if (score >= 8) return "Great";
  if (score >= 7) return "Good";
  if (score >= 5) return "Mixed";
  return "Weak";
}

function ScoreRing({ value }: { value: number }) {
  return (
    <div
      role="img"
      aria-label={`Overall score ${value} out of 10`}
      className="relative size-[72px] shrink-0"
    >
      <svg viewBox="0 0 72 72" className="size-full -rotate-90" aria-hidden>
        <circle cx="36" cy="36" r={RING_RADIUS} fill="none" strokeWidth="6" className="stroke-muted" />
        <circle
          cx="36"
          cy="36"
          r={RING_RADIUS}
          fill="none"
          strokeWidth="6"
          strokeLinecap="round"
          className="stroke-primary"
          strokeDasharray={RING_LENGTH}
          strokeDashoffset={RING_LENGTH * (1 - value / 10)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span className="font-heading text-2xl font-bold text-primary">{value}</span>
        <span className="mt-0.5 text-[10px] text-muted-foreground">/10</span>
      </div>
    </div>
  );
}

export function ReviewRatingsPanel({ ratings }: { ratings: ReviewRatings }) {
  const rows = RATING_CRITERIA.flatMap(({ key, label }) => {
    const value = ratings[key];
    return value === null ? [] : [{ key, label, value }];
  });

  if (ratings.overall === null && rows.length === 0) return null;

  return (
    <section className="flex flex-col gap-4 rounded-2xl border bg-card p-4 sm:flex-row sm:items-center sm:gap-6 lg:flex-col lg:items-stretch lg:gap-4">
      {ratings.overall !== null && (
        <div className="flex items-center gap-4">
          <ScoreRing value={ratings.overall} />
          <div>
            <p className="text-sm font-semibold">Overall score</p>
            <p className="text-xs text-muted-foreground">{scoreLabel(ratings.overall)}</p>
          </div>
        </div>
      )}

      {rows.length > 0 && (
        <ul className="flex flex-1 flex-col gap-2.5">
          {rows.map(({ key, label, value }) => (
            <li key={key} className="grid grid-cols-[72px_1fr_24px] items-center gap-2 text-xs">
              <span className="truncate text-muted-foreground">{label}</span>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: `${value * 10}%` }} />
              </div>
              <span className="text-right font-medium tabular-nums">{value}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}