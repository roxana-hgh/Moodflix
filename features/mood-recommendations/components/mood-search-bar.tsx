"use client";

import { useState } from "react";
import { Sparkles, Heart, Gem, CloudRain, Brain, TreePine } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const QUICK_MOODS = [
  { label: "cozy rom-com", icon: Heart },
  { label: "heist thriller", icon: Gem },
  { label: "something to cry to", icon: CloudRain },
  { label: "mind-bending sci-fi", icon: Brain },
  { label: "mystery set in nature", icon: TreePine },
];

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
      <h1 className="font-heading text-3xl sm:text-4xl font-semibold tracking-tight text-foreground mb-6 max-w-xl ">
        What are you in the mood for?
      </h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(value);
        }}
        className="relative w-full"
      >
        <div
          className={cn(
            "flex items-center gap-3 rounded-2xl border border-input bg-card max-sm:pe-2 px-3 py-1.5 w-full",
            "transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
          )}
        >
          <Sparkles className="size-4.5 text-primary shrink-0" />
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="a mystery set in nature…"
            disabled={isPending}
            className="flex-1 bg-transparent text-sm sm:text-base  text-foreground placeholder:text-muted-foreground/70 outline-none disabled:opacity-50"
          />
          <Button
            type="submit"
            disabled={isPending || value.trim().length < 3}
           size={"sm"}
          >
            Find something
          </Button>
        </div>
      </form>

      <div className="flex flex-wrap gap-2 mt-4">
        {QUICK_MOODS.map(({ label, icon: Icon }) => (
          <button
            key={label}
            type="button"
            onClick={() => {
              setValue(label);
              submit(label);
            }}
            disabled={isPending}
            className={cn(
              "inline-flex items-center gap-1.5 text-sm text-muted-foreground border border-border rounded-full",
              "px-3.5 py-1.5 hover:text-foreground hover:border-foreground/30 hover:bg-accent transition-colors",
              "disabled:opacity-40"
            )}
          >
            <Icon className="size-3.5" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}