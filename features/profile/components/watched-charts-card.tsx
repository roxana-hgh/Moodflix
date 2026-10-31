"use client";

import { useId, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, LabelList, ReferenceDot, XAxis, YAxis } from "recharts";
import { BarChart3, CalendarRange, ChevronDown, Clock, Clapperboard, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import type { ChartDatum, StatsScope, WatchedCharts } from "@/features/lists/types";
import { cn } from "@/lib/utils";

type ViewKey = "genres" | "activity" | "decades";
type Period = "monthly" | "yearly";

const VIEWS: { key: ViewKey; label: string; icon: LucideIcon }[] = [
  { key: "genres", label: "Genres", icon: Clapperboard },
  { key: "activity", label: "Watch time", icon: Clock },
  { key: "decades", label: "Decades", icon: CalendarRange },
];

const SCOPES: { key: StatsScope; label: string }[] = [
  { key: "all", label: "All" },
  { key: "movie", label: "Movies" },
  { key: "tv", label: "TV" },
];

const PERIODS: { key: Period; label: string }[] = [
  { key: "monthly", label: "Monthly" },
  { key: "yearly", label: "Yearly" },
];

const DEFAULT_VISIBLE = 10;
const CHART_HEIGHT = "h-[240px]";

const LIST_CLASS = "h-9 p-1 group-data-[orientation=horizontal]/tabs:h-9";
const TRIGGER_CLASS =
  "gap-1.5 px-3 text-xs data-[state=active]:bg-primary/15 data-[state=active]:text-foreground dark:data-[state=active]:border-primary/30 dark:data-[state=active]:bg-primary/15";

function getMeta(view: ViewKey, period: Period) {
  if (view === "genres") return { title: "Genres you watch", description: "Titles per genre", unit: "Titles" };
  if (view === "decades") return { title: "Release decades", description: "Titles by decade of release", unit: "Titles" };
  return {
    title: "Watch time",
    description: period === "monthly" ? "Hours per month, last 12 months" : "Hours per year",
    unit: "Hours",
  };
}

function formatHours(hours: number) {
  const rounded = hours >= 10 ? Math.round(hours) : Math.round(hours * 10) / 10;
  return `${rounded.toLocaleString("en-US")}h`;
}

function formatTitles(count: number) {
  return `${count} ${count === 1 ? "title" : "titles"}`;
}

function getPeak(data: ChartDatum[]) {
  return data.reduce((peak, d) => (d.value > peak.value ? d : peak));
}

function getInsight(view: ViewKey, period: Period, data: ChartDatum[]) {
  const peak = getPeak(data);

  if (view === "genres") {
    return {
      eyebrow: "Top genre",
      value: peak.label,
      caption: formatTitles(peak.value),
      facts: [
        { label: "Genres explored", value: String(data.length) },
        { label: "Runner-up", value: data[1]?.label ?? "—" },
      ],
    };
  }

  if (view === "decades") {
    return {
      eyebrow: "Favorite era",
      value: peak.label,
      caption: formatTitles(peak.value),
      facts: [
        { label: "Decades spanned", value: String(data.length) },
        { label: "Oldest", value: data[0].label },
      ],
    };
  }

  const total = data.reduce((sum, d) => sum + d.value, 0);
  const monthly = period === "monthly";

  return {
    eyebrow: monthly ? "Last 12 months" : "All time",
    value: formatHours(total),
    caption: "of watch time",
    facts: [
      { label: monthly ? "Peak month" : "Peak year", value: `${peak.full ?? peak.label} · ${formatHours(peak.value)}` },
      { label: monthly ? "Monthly average" : "Yearly average", value: formatHours(total / data.length) },
    ],
  };
}

function tooltipTitle(_: unknown, payload: readonly { payload?: ChartDatum }[] | undefined) {
  const d = payload?.[0]?.payload;
  return d?.full ?? d?.label ?? "";
}

function InsightPanel({ insight }: { insight: ReturnType<typeof getInsight> }) {
  return (
    <aside className="flex flex-col gap-5 border-b bg-linear-to-br from-primary/10 to-transparent p-5 md:border-r md:border-b-0">
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{insight.eyebrow}</p>
        <p className="mt-2 text-3xl font-semibold leading-tight tracking-tight wrap-break-word">{insight.value}</p>
        <p className="mt-1 text-sm text-muted-foreground">{insight.caption}</p>
      </div>

      <dl className="mt-auto grid grid-cols-2 gap-4 md:grid-cols-1">
        {insight.facts.map((fact) => (
          <div key={fact.label} className="min-w-0">
            <dt className="text-xs text-muted-foreground">{fact.label}</dt>
            <dd className="mt-0.5 text-sm font-medium wrap-break-word">{fact.value}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}

function ChartDataTable({ caption, unit, data }: { caption: string; unit: string; data: ChartDatum[] }) {
  return (
    <table className="sr-only">
      <caption>{caption}</caption>
      <thead>
        <tr>
          <th scope="col">Period</th>
          <th scope="col">{unit}</th>
        </tr>
      </thead>
      <tbody>
        {data.map((d) => (
          <tr key={d.label}>
            <th scope="row">{d.full ?? d.label}</th>
            <td>{d.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function GenreRanking({ data }: { data: ChartDatum[] }) {
  const max = data[0].value;

  return (
    <ol className="-mx-2 space-y-0.5">
      {data.map((d, i) => (
        <li
          key={d.label}
          className="group grid grid-cols-[1.25rem_7rem_minmax(0,1fr)_2rem] items-center gap-3 rounded-md px-2 py-1.5 transition-colors hover:bg-muted/40 sm:grid-cols-[1.25rem_9rem_minmax(0,1fr)_2rem]"
        >
          <span className="text-right text-xs tabular-nums text-muted-foreground">{i + 1}</span>
          <span title={d.label} className="truncate text-sm">{d.label}</span>
          <span className="h-2">
            <span
              className={cn(
                "block h-full min-w-1 rounded-r-[4px] transition-[width,background-color] duration-500 motion-reduce:transition-none",
                i === 0 ? "bg-primary" : "bg-primary/45 group-hover:bg-primary/70"
              )}
              style={{ width: `${(d.value / max) * 100}%` }}
            />
          </span>
          <span className="text-right text-sm font-medium tabular-nums">{d.value}</span>
        </li>
      ))}
    </ol>
  );
}

function TrendArea({ data, config }: { data: ChartDatum[]; config: ChartConfig }) {
  const gradientId = `trend-${useId().replace(/\W/g, "")}`;
  const peak = getPeak(data);

  return (
    <ChartContainer config={config} className={cn("aspect-auto w-full", CHART_HEIGHT)}>
      <AreaChart data={data} margin={{ top: 24, right: 20, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-value)" stopOpacity={0.28} />
            <stop offset="100%" stopColor="var(--color-value)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} interval="preserveStartEnd" minTickGap={16} />
        <YAxis
          width={36}
          tickLine={false}
          axisLine={false}
          tickCount={4}
          allowDecimals={false}
          tickFormatter={(v) => `${v}h`}
        />
        <ChartTooltip content={<ChartTooltipContent hideIndicator labelFormatter={tooltipTitle} />} />
        <Area
          type="monotone"
          dataKey="value"
          stroke="var(--color-value)"
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          activeDot={{ r: 5, fill: "var(--color-value)", stroke: "var(--background)", strokeWidth: 2 }}
          animationDuration={600}
        />
        <ReferenceDot
          x={peak.label}
          y={peak.value}
          r={4}
          fill="var(--color-value)"
          stroke="var(--background)"
          strokeWidth={2}
          label={{ value: formatHours(peak.value), position: "top", offset: 10, className: "fill-foreground text-xs font-medium" }}
        />
      </AreaChart>
    </ChartContainer>
  );
}

const SLOT_WIDTH = 76; // عرض هر ستون؛ با داده‌ی کم نمودار فشرده می‌مونه

function Columns({ data, config }: { data: ChartDatum[]; config: ChartConfig }) {
  const max = Math.max(...data.map((d) => d.value));
  const showValues = data.length <= 12;

  return (
    <ChartContainer
      config={config}
      className={cn("mx-auto aspect-auto w-full", CHART_HEIGHT)}
      style={{ maxWidth: data.length * SLOT_WIDTH }}
    >
      <BarChart data={data} margin={{ top: 20, right: 4, left: 4, bottom: 0 }}>
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={{ stroke: "var(--border)" }}
          tickMargin={8}
          interval={data.length > 12 ? "preserveStartEnd" : 0}
          className="text-xs"
        />
        <YAxis hide domain={[0, "dataMax"]} />
        <ChartTooltip
          cursor={{ fill: "var(--muted)", opacity: 0.3, radius: 4 }}
          content={<ChartTooltipContent hideIndicator labelFormatter={tooltipTitle} />}
        />
        <Bar dataKey="value" fill="var(--color-value)" radius={[4, 4, 0, 0]} maxBarSize={24} animationDuration={600}>
          {data.map((d) => (
            <Cell key={d.label} fillOpacity={d.value === max ? 1 : 0.45} />
          ))}
          {showValues && (
            <LabelList
              dataKey="value"
              position="top"
              offset={6}
              className="fill-muted-foreground text-[11px]"
              formatter={(v) => (v === 0 ? "" : v)}
            />
          )}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

export function WatchedChartsCard({ charts }: { charts: WatchedCharts }) {
  const [view, setView] = useState<ViewKey>("genres");
  const [scope, setScope] = useState<StatsScope>("all");
  const [period, setPeriod] = useState<Period>("monthly");
  const [expanded, setExpanded] = useState(false);

  const meta = getMeta(view, period);
  const config = { value: { label: meta.unit, color: "var(--primary)" } } satisfies ChartConfig;

  const data =
    view === "genres" ? charts.genres[scope] : view === "decades" ? charts.decades[scope] : charts[period][scope];

  const hasData = data.some((d) => d.value > 0);
  const isRanking = view === "genres";
  const canExpand = isRanking && data.length > DEFAULT_VISIBLE;
  const visible = isRanking && !expanded ? data.slice(0, DEFAULT_VISIBLE) : data;

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          value={view}
          onValueChange={(v) => {
            setView(v as ViewKey);
            setExpanded(false);
          }}
        >
          <TabsList className={cn(LIST_CLASS, "w-full sm:w-auto")}>
            {VIEWS.map(({ key, label, icon: Icon }) => (
              <TabsTrigger key={key} value={key} className={TRIGGER_CLASS}>
                <Icon className="size-3.5" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          {view === "activity" && (
            <Tabs className="flex-1 sm:flex-none" value={period} onValueChange={(v) => setPeriod(v as Period)}>
              <TabsList className={cn(LIST_CLASS, "w-full")}>
                {PERIODS.map(({ key, label }) => (
                  <TabsTrigger key={key} value={key} className={TRIGGER_CLASS}>{label}</TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          )}

          <Tabs
            className="flex-1 sm:flex-none"
            value={scope}
            onValueChange={(v) => {
              setScope(v as StatsScope);
              setExpanded(false);
            }}
          >
            <TabsList className={cn(LIST_CLASS, "w-full")}>
              {SCOPES.map(({ key, label }) => (
                <TabsTrigger key={key} value={key} className={TRIGGER_CLASS}>{label}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      <Card className="gap-0 overflow-hidden rounded-xl border border-border/50 bg-card/40 py-0 shadow-none sm:py-0">
        {!hasData ? (
          <div className="flex flex-col items-center gap-2 py-14 text-center">
            <BarChart3 className="h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">No data yet.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-[15rem_minmax(0,1fr)]">
            <InsightPanel insight={getInsight(view, period, data)} />

            <div className="min-w-0 space-y-4 p-5">
              <div>
                <h3 className="text-sm font-medium">{meta.title}</h3>
                <p className="text-xs text-muted-foreground">{meta.description}</p>
              </div>

              {isRanking ? (
                <GenreRanking data={visible} />
              ) : view === "activity" && period === "monthly" ? (
                <TrendArea data={visible} config={config} />
              ) : (
                <Columns data={visible} config={config} />
              )}

              {!isRanking && <ChartDataTable caption={meta.description} unit={meta.unit} data={visible} />}

              {view === "activity" && (
                <p className="text-xs text-muted-foreground">
                  Based on when you marked titles as watched. TV runtime is estimated.
                </p>
              )}

              {canExpand && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full gap-1 text-muted-foreground"
                  onClick={() => setExpanded((v) => !v)}
                >
                  <span className="text-xs sm:text-sm">{expanded ? "Show less" : `Show all ${data.length} genres`}</span>
                  <ChevronDown className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")} />
                </Button>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
