"use client";

import { useState } from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { QuickMoodSuggestions } from "./quick-mood-suggestions";

interface MoodSearchBarProps {
  onSubmit: (mood: string) => void;
  isPending: boolean;
}

export function MoodSearchBar({ onSubmit, isPending }: MoodSearchBarProps) {
  const [value, setValue] = useState("");

  const submit = (mood: string) => {
    const trimmed = mood.trim();
    if (trimmed.length < 3 || isPending) return;
    onSubmit(trimmed);
  };

  return (
    <div className="w-full">
      <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-foreground mb-5 sm:mb-6 max-w-xl">
        What are you in the mood for?
      </h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(value);
        }}
      >
        <div
          className={cn(
            "flex items-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl border border-input bg-card",
            "px-3 py-1 sm:px-4 sm:py-1.5 pe-1 sm:pe-1.5",
            "transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
          )}
        >
          <Sparkles className="size-4 sm:size-5 text-primary shrink-0" />
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="a mystery set in nature…"
            disabled={isPending}
            className="min-w-0 flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground/70 outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isPending || value.trim().length < 3}
            aria-label="Find something"
            className={cn(
              "shrink-0 inline-flex items-center gap-1.5 rounded-lg sm:rounded-xl bg-primary text-primary-foreground",
              "text-sm font-medium",
              "size-9 sm:size-auto sm:px-4 sm:py-2 justify-center",
              "hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:pointer-events-none"
            )}
          >
            <ArrowRight className="size-4 sm:hidden" />
            <span className="hidden sm:inline">Find something</span>
          </button>
        </div>
      </form>

      <QuickMoodSuggestions
        disabled={isPending}
        onSelect={(mood) => {
          setValue(mood);
          submit(mood);
        }}
      />
    </div>
  );
}