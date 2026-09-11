"use client";

import { Clapperboard, Tv, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

export type MediaTypeFilter = "all" | "movie" | "tv";

interface MediaTypeToggleProps {
  value: MediaTypeFilter;
  onChange: (value: MediaTypeFilter) => void;
  counts: { all: number; movie: number; tv: number };
}

const OPTIONS: { value: MediaTypeFilter; label: string; icon: typeof LayoutGrid }[] = [
  { value: "all", label: "All", icon: LayoutGrid },
  { value: "movie", label: "Movies", icon: Clapperboard },
  { value: "tv", label: "Shows", icon: Tv },
];

export function MediaTypeToggle({ value, onChange, counts }: MediaTypeToggleProps) {
  return (
    <div className="inline-flex rounded-full border p-0.5 max-w-full overflow-x-auto scrollbar-hide">
      {OPTIONS.map(({ value: optValue, label, icon: Icon }) => (
        <button
          key={optValue}
          type="button"
          onClick={() => onChange(optValue)}
          className={cn(
            "inline-flex items-center gap-1 sm:gap-1.5 rounded-full whitespace-nowrap transition-colors",
            "px-2.5 py-1.5 sm:px-3.5 text-xs sm:text-sm font-medium",
            value === optValue
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Icon className="size-3 sm:size-3.5" />
          {label}
          <span className={cn("text-[10px] sm:text-xs", value === optValue ? "opacity-80" : "opacity-60")}>
            {counts[optValue]}
          </span>
        </button>
      ))}
    </div>
  );
}