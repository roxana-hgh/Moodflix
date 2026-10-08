import { RATING_CRITERIA } from "../schema";
import type { ReviewRatings } from "../types";

export function ReviewRatingsPanel({ ratings }: { ratings: ReviewRatings }) {
  const rows = RATING_CRITERIA.flatMap(({ key, label }) => {
    const value = ratings[key];
    return value === null ? [] : [{ key, label, value }];
  });

  if (ratings.overall === null && rows.length === 0) return null;

  return (
    <section className="grid gap-5 rounded-2xl border bg-card p-4 sm:grid-cols-[140px_1fr] sm:p-5">
      {ratings.overall !== null && (
        <div className="flex flex-col items-center justify-center rounded-xl bg-primary/10 p-4">
          <p className="font-heading text-4xl font-bold text-primary">
            {ratings.overall}
            <span className="text-base font-normal text-muted-foreground">/10</span>
          </p>
          <p className="text-xs text-muted-foreground">Overall</p>
        </div>
      )}
      {rows.length > 0 && (
        <ul className="flex flex-col justify-center gap-3">
          {rows.map(({ key, label, value }) => (
            <li key={key} className="flex items-center gap-3 text-sm">
              <span className="w-24 shrink-0 text-muted-foreground">{label}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: `${value * 10}%` }} />
              </div>
              <span className="w-10 shrink-0 text-right tabular-nums font-medium">{value}/10</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}