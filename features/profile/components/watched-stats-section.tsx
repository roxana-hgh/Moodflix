import { Film, Clock, Star, Sparkles, CalendarCheck, type LucideIcon } from "lucide-react";
import { formatDuration } from "@/utils/format";
import type { WatchedCharts, WatchedStats } from "@/features/lists/types";
import { WatchedChartsCard } from "./watched-charts-card";

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  className = "",
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint: string;
  className?: string;
}) {
  return (
    <div className={`flex min-w-0 flex-col gap-1.5 rounded-md border bg-card/60 p-3 md:p-4 py-3 ${className}`}>
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Icon className="h-3.5 w-3.5 shrink-0 text-primary" />
        <span className="truncate">{label}</span>
      </div>
      <p className="truncate text-lg font-semibold leading-tight tracking-tight">{value}</p>
      <p className="truncate text-[11px] text-muted-foreground">{hint}</p>
    </div>
  );
}

export function WatchedStatsSection({ stats }: { stats: WatchedStats;}) {
  if (stats.total === 0) return null;

  const topGenreCount = stats.genres.all[0]?.count;

  return (
    <section className="space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard
          className="col-span-2 sm:col-span-1"
          icon={Film}
          label="Total watched"
          value={stats.total}
          hint={`${stats.movies} movies · ${stats.shows} shows`}
        />
        <StatCard
          icon={Clock}
          label="Time watched"
          value={stats.totalMinutes ? formatDuration(stats.totalMinutes) : "—"}
          hint="Estimated"
        />
        <StatCard
          icon={Star}
          label="Avg. rating"
          value={stats.avgRating ? stats.avgRating.toFixed(1) : "—"}
          hint="TMDB score"
        />
        <StatCard
          icon={Sparkles}
          label="Top genre"
          value={stats.topGenre ?? "—"}
          hint={topGenreCount ? `${topGenreCount} titles` : "No data yet"}
        />
        <StatCard
          icon={CalendarCheck}
          label="This month"
          value={stats.thisMonth}
          hint="Titles watched"
        />
      </div>

      
    </section>
  );
}