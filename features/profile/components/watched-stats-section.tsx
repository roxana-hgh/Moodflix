import { ArrowDownRight, ArrowUpRight, CalendarCheck, Clock, Film, Minus, Sparkles, Star, type LucideIcon } from "lucide-react";
import { formatDuration } from "@/utils/format";
import type { ChartDatum, WatchedStats } from "@/features/lists/types";

const SPARK_WIDTH = 148;
const SPARK_HEIGHT = 52;
const SPARK_PADDING = 6;

function Sparkline({ data }: { data: ChartDatum[] }) {
  const max = Math.max(...data.map((d) => d.value));
  if (max === 0) return null;

  const stepX = (SPARK_WIDTH - SPARK_PADDING * 2) / (data.length - 1);
  const points = data.map((d, i) => ({
    x: SPARK_PADDING + i * stepX,
    y: SPARK_HEIGHT - SPARK_PADDING - (d.value / max) * (SPARK_HEIGHT - SPARK_PADDING * 2),
  }));
  const line = points.map((p) => `${p.x},${p.y}`).join(" ");
  const last = points[points.length - 1];
  const baseline = SPARK_HEIGHT - SPARK_PADDING;

  return (
    <div className="hidden shrink-0 flex-col items-end gap-1 min-[420px]:flex">
      <svg width={SPARK_WIDTH} height={SPARK_HEIGHT} viewBox={`0 0 ${SPARK_WIDTH} ${SPARK_HEIGHT}`} aria-hidden>
        <polygon points={`${points[0].x},${baseline} ${line} ${last.x},${baseline}`} className="fill-primary/10" />
        <polyline points={line} fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="stroke-primary" />
        <circle cx={last.x} cy={last.y} r={4} strokeWidth={2} className="fill-primary stroke-background" />
      </svg>
      <span className="text-[11px] text-muted-foreground">Last 12 months</span>
    </div>
  );
}

function SplitLegendItem({ swatch, label, value }: { swatch: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className={`h-2.5 w-2.5 rounded-[3px] ${swatch}`} />
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function TimeWatchedCard({ stats, monthlyHours }: { stats: WatchedStats; monthlyHours: ChartDatum[] }) {
  const { totalMinutes, movieMinutes, tvMinutes } = stats;

  return (
    <div className="col-span-2 flex min-w-0 flex-col gap-5 rounded-xl border bg-linear-to-br from-primary/15 via-card/60 to-card/40 p-5 lg:row-span-2">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Clock className="h-4 w-4" />
        </span>
        Time watched
      </div>

      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-5xl font-semibold tracking-tight">
            {totalMinutes ? formatDuration(totalMinutes) : "—"}
          </p>
          <p className="mt-1.5 text-xs text-muted-foreground">Estimated from runtimes</p>
        </div>
        <Sparkline data={monthlyHours} />
      </div>

      {totalMinutes > 0 && (
        <div className="mt-auto space-y-2.5">
          <div className="flex h-2 gap-0.5" aria-hidden>
            {movieMinutes > 0 && (
              <div className="min-w-1 basis-0 rounded-l-full bg-primary last:rounded-r-full" style={{ flexGrow: movieMinutes }} />
            )}
            {tvMinutes > 0 && (
              <div className="min-w-1 basis-0 rounded-r-full bg-chart-secondary first:rounded-l-full" style={{ flexGrow: tvMinutes }} />
            )}
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-1">
            <SplitLegendItem swatch="bg-primary" label="Movies" value={movieMinutes ? formatDuration(movieMinutes) : "—"} />
            <SplitLegendItem swatch="bg-chart-secondary" label="TV" value={tvMinutes ? formatDuration(tvMinutes) : "—"} />
          </div>
        </div>
      )}
    </div>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  hint,
  meter,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint: React.ReactNode;
  meter?: number;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-3 rounded-xl border bg-card/40 p-4 transition-colors hover:border-primary/30">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Icon className="h-4 w-4" />
        </span>
        <span className="truncate">{label}</span>
      </div>
      <p className="truncate text-2xl font-semibold leading-none tracking-tight">{value}</p>
      {meter !== undefined && (
        <div className="h-1.5 rounded-full bg-primary/15" aria-hidden>
          <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(meter, 1) * 100}%` }} />
        </div>
      )}
      <div className="truncate text-xs text-muted-foreground">{hint}</div>
    </div>
  );
}

function MonthDelta({ diff }: { diff: number }) {
  const Icon = diff > 0 ? ArrowUpRight : diff < 0 ? ArrowDownRight : Minus;
  const text = diff === 0 ? "Same as last month" : `${diff > 0 ? "+" : "−"}${Math.abs(diff)} vs last month`;

  return (
    <span className="flex items-center gap-1">
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate">{text}</span>
    </span>
  );
}

export function WatchedStatsSection({ stats, monthlyHours }: { stats: WatchedStats; monthlyHours: ChartDatum[] }) {
  if (stats.total === 0) return null;

  const topGenreCount = stats.genres.all[0]?.count;
  const topGenreShare = topGenreCount ? topGenreCount / stats.total : undefined;

  return (
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <TimeWatchedCard stats={stats} monthlyHours={monthlyHours} />
      <StatTile
        icon={Film}
        label="Total watched"
        value={stats.total}
        hint={`${stats.movies} movies · ${stats.shows} shows`}
      />
      <StatTile
        icon={CalendarCheck}
        label="This month"
        value={stats.thisMonth}
        hint={<MonthDelta diff={stats.thisMonth - stats.lastMonth} />}
      />
      <StatTile
        icon={Star}
        label="Avg. TMDB score"
        value={stats.avgRating ? stats.avgRating.toFixed(1) : "—"}
        meter={stats.avgRating ? stats.avgRating / 10 : undefined}
        hint="Out of 10"
      />
      <StatTile
        icon={Sparkles}
        label="Top genre"
        value={stats.topGenre ?? "—"}
        meter={topGenreShare}
        hint={topGenreShare ? `${Math.round(topGenreShare * 100)}% of your titles` : "No data yet"}
      />
    </section>
  );
}
