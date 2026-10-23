import { cn } from "@/lib/utils";
import type { RatingStats } from "../types";

const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });

function SourceStat({ label, dotClass, stats }: { label: string; dotClass: string; stats: RatingStats }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("size-1.5 rounded-full", dotClass)} />
      <span className="font-medium uppercase tracking-wide">{label}</span>
      {stats.average !== null ? (
        <>
          <span className="font-semibold text-foreground">{stats.average.toFixed(1)}</span>
          <span className="-ml-1">/10</span>
          <span className="opacity-70">· {compact.format(stats.count)}</span>
        </>
      ) : (
        <span className="opacity-70">No ratings yet</span>
      )}
    </span>
  );
}

export function RatingSummary({ tmdb, moodflix }: { tmdb: RatingStats; moodflix: RatingStats }) {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[11px] text-muted-foreground">
      <SourceStat label="TMDB" dotClass="bg-sky-400" stats={tmdb} />
      <SourceStat label="Moodflix" dotClass="bg-primary" stats={moodflix} />
    </div>
  );
}