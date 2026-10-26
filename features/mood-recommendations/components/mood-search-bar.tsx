"use client";

import { useState } from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { MAX_MOOD_SELECTIONS, type MoodSearchRequest } from "../schema";
import { MoodPicker } from "@/features/mood-recommendations/components/MoodPicker";


const MEDIA_TYPES = [
  { value: "both", label: "Both" },
  { value: "movie", label: "Movies" },
  { value: "tv", label: "TV" },
] as const;

interface MoodSearchBarProps {
  onSubmit: (request: MoodSearchRequest) => void;
  isPending: boolean;
}

export function MoodSearchBar({ onSubmit, isPending }: MoodSearchBarProps) {
  const [value, setValue] = useState("");
  const [selections, setSelections] = useState<string[]>([]);
  const [mediaType, setMediaType] = useState<MoodSearchRequest["mediaType"]>("both");

  const trimmed = value.trim();
  const hasText = trimmed.length >= 3;
  const canSubmit = !isPending && (hasText || selections.length > 0);

  const toggle = (id: string) =>
    setSelections((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      return prev.length >= MAX_MOOD_SELECTIONS ? prev : [...prev, id];
    });

  const submit = () => {
    if (!canSubmit) return;
    onSubmit({ text: hasText ? trimmed : "", selections, mediaType });
  };

  return (
    <div className="w-full">
      <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-foreground mb-5 sm:mb-6 max-w-xl">
        What are you in the mood for?
      </h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
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
            disabled={!canSubmit}
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

      <div className="mt-3 px-2 flex flex-wrap items-center justify-between gap-2">
        <div
          role="radiogroup"
          aria-label="Type"
          className="inline-flex rounded-full border border-border p-0.5"
        >
          {MEDIA_TYPES.map(({ value: type, label }) => (
            <button
              key={type}
              type="button"
              role="radio"
              aria-checked={mediaType === type}
              onClick={() => setMediaType(type)}
              disabled={isPending}
              className={cn(
                "rounded-full px-3 py-1 text-xs sm:text-sm transition-colors disabled:opacity-40",
                mediaType === type
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {selections.length > 0 && (
          <div className="flex items-center gap-3 text-xs sm:text-sm text-muted-foreground">
            <span>
              {selections.length}/{MAX_MOOD_SELECTIONS} picked
            </span>
            <button
              type="button"
              onClick={() => setSelections([])}
              disabled={isPending}
              className="underline underline-offset-4 hover:text-foreground transition-colors disabled:opacity-40"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      <MoodPicker selected={selections} onToggle={toggle} disabled={isPending} />
    </div>
  );
}