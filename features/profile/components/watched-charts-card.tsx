"use client";

import { useState } from "react";
import { Bar, BarChart, Cell, LabelList, XAxis, YAxis } from "recharts";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import type { ChartDatum, StatsScope, WatchedCharts } from "@/features/lists/types";
import { cn } from "@/lib/utils";

type ViewKey = "genres" | "activity" | "decades";
type Period = "monthly" | "yearly";

const VIEWS: { key: ViewKey; label: string }[] = [
  { key: "genres", label: "Genres" },
  { key: "activity", label: "Watch time" },
  { key: "decades", label: "Decades" },
];

const DEFAULT_VISIBLE = 10;
const ROW_HEIGHT = 34;
const MAX_LABEL_CHARS = 22;
const CHAR_WIDTH = 6.6;

function getMeta(view: ViewKey, period: Period) {
  if (view === "genres")
    return { title: "Genres you watch", description: "Titles per genre", unit: "Titles", horizontal: true };
  if (view === "decades")
    return { title: "Release decades", description: "Titles by decade of release", unit: "Titles", horizontal: false };
  return {
    title: "Watch time",
    description: period === "monthly" ? "Hours per month, last 12 months" : "Hours per year",
    unit: "Hours",
    horizontal: false,
  };
}

function truncate(value: string, max = MAX_LABEL_CHARS) {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

function LabelTick({ y, payload }: { y?: number; payload?: { value: string } }) {
  return (
    <text x={0} y={y} textAnchor="start" dominantBaseline="central" className="fill-muted-foreground text-xs">
      {truncate(payload?.value ?? "")}
    </text>
  );
}

function tooltipTitle(_: unknown, payload: readonly { payload?: ChartDatum }[] | undefined) {
  const d = payload?.[0]?.payload;
  return d?.full ?? d?.label ?? "";
}

function HorizontalBars({ data, config }: { data: ChartDatum[]; config: ChartConfig }) {
  const longest = data.reduce((m, d) => Math.max(m, Math.min(d.label.length, MAX_LABEL_CHARS)), 0);
  const labelWidth = Math.max(56, Math.round(longest * CHAR_WIDTH) + 12);

  return (
    <ChartContainer config={config} className="aspect-auto w-full" style={{ height: data.length * ROW_HEIGHT + 8 }}>
      <BarChart data={data} layout="vertical" margin={{ left: 0, right: 24, top: 0, bottom: 0 }} barCategoryGap={10}>
        <XAxis type="number" dataKey="value" hide />
        <YAxis type="category" dataKey="label" width={labelWidth} tickLine={false} axisLine={false} tick={<LabelTick />} />
        <ChartTooltip cursor={{ fill: "var(--muted)", opacity: 0.4 }} content={<ChartTooltipContent hideIndicator />} />
        <Bar dataKey="value" fill="var(--color-value)" radius={6} barSize={10}>
          {data.map((d, i) => (
            <Cell key={d.label} fillOpacity={Math.max(0.35, 1 - i * 0.07)} />
          ))}
          <LabelList dataKey="value" position="right" offset={8} className="fill-muted-foreground text-xs" />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

const SLOT_WIDTH = 76; // عرض هر ستون؛ با داده‌ی کم نمودار فشرده می‌مونه

function VerticalBars({ data, config }: { data: ChartDatum[]; config: ChartConfig }) {
  const max = Math.max(...data.map((d) => d.value));
  const showValues = data.length <= 12;

  return (
    <ChartContainer
      config={config}
      className="aspect-auto h-[160px] w-full"
      style={{ maxWidth: data.length * SLOT_WIDTH }}
    >
      <BarChart data={data} margin={{ top: 20, right: 4, left: 4, bottom: 0 }}>
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          interval={data.length > 12 ? "preserveStartEnd" : 0}
          className="text-xs"
        />
        <YAxis hide domain={[0, "dataMax"]} />
        <ChartTooltip
          cursor={{ fill: "var(--muted)", opacity: 0.3, radius: 6 }}
          content={<ChartTooltipContent hideIndicator labelFormatter={tooltipTitle} />}
        />
        <Bar dataKey="value" fill="var(--color-value)" radius={[6, 6, 0, 0]} maxBarSize={32}>
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
  const canExpand = meta.horizontal && data.length > DEFAULT_VISIBLE;
  const visible = meta.horizontal && !expanded ? data.slice(0, DEFAULT_VISIBLE) : data;

  const reset = () => setExpanded(false);

  return (
    <Card className="h-full bg-card/60">
      <CardHeader className="gap-4">
        {/* Main view switcher: underline style */}
        <div role="tablist" className="flex gap-1 border-b">
          {VIEWS.map((v) => {
            const active = view === v.key;
            return (
              <button
                key={v.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => {
                  setView(v.key);
                  setExpanded(false);
                }}
                className={cn(
                  "relative -mb-px px-1 pb-2.5 pt-1 text-sm font-medium transition-colors",
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {v.label}
                {active && <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-primary" />}
              </button>
            );
          })}
        </div>

        {/* Per-view header + scope tabs */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between p-0.5">
          <div className="space-y-1">
            <CardTitle>{meta.title}</CardTitle>
            <CardDescription>{meta.description}</CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2 p-1">
            {view === "activity" && (
              <div className="inline-flex rounded-md border p-0.5 text-xs">
                {(["monthly", "yearly"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPeriod(p)}
                    className={cn(
                      "rounded px-2.5 py-1 capitalize transition-colors",
                      period === p ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}

            <Tabs
              value={scope}
              onValueChange={(v) => {
                setScope(v as StatsScope);
                reset();
              }}
            >
              <TabsList className="grid w-full grid-cols-3 sm:w-auto">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="movie">Movies</TabsTrigger>
                <TabsTrigger value="tv">TV</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex gap-2 flex-col justify-center">
        {!hasData ? (
          <p className="py-10 text-center text-sm text-muted-foreground">No data yet.</p>
        ) : meta.horizontal ? (
          <HorizontalBars data={visible} config={config} />
        ) : (
          <VerticalBars data={visible} config={config} />
        )}
        {view === "activity" && hasData && (
          <p className="pt-3 text-xs text-muted-foreground">
            Based on when you marked titles as watched. TV runtime is estimated.
          </p>
        )}
      </CardContent>

      {canExpand && (
        <CardFooter>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full gap-1 text-muted-foreground"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? "Show less" : `Show all ${data.length} genres`}
            <ChevronDown className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")} />
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}