"use client";

import { useState } from "react";
import {
  Smile,
  Frown,
  Coffee,
  Heart,
  Zap,
  Search,
  Hourglass,
  HeartCrack,
  Moon,
  Users,
  Umbrella,
  Sparkles,
  Eye,
  Tv,
  Flame,
  Brain,
  Ghost,
  CloudRain,
  Skull,
  Gem,
  Fingerprint,
  Award,
  Swords,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ExpandToggle } from "@/components/shared/expand-toggle";

import { MAX_MOOD_SELECTIONS } from "../schema";
import { MOOD_GROUPS, MOOD_OPTIONS } from "@/features/mood-recommendations/Constants";

// Static lookup (no dynamic class/icon construction). Unknown ids fall back to Sparkles.
const ICONS: Record<string, LucideIcon> = {
  happy: Smile,
  sad: Frown,
  chill: Coffee,
  romantic: Heart,
  excited: Zap,
  curious: Search,
  nostalgic: Hourglass,
  heartbroken: HeartCrack,
  "date-night": Moon,
  "family-night": Users,
  "rainy-day": Umbrella,
  "comfort-watch": Sparkles,
  "background-watch": Eye,
  "binge-worthy": Tv,
  "slow-burn": Flame,
  "mind-bending": Brain,
  suspense: Ghost,
  tearjerker: CloudRain,
  "dark-twisted": Skull,
  "hidden-gems": Gem,
  "true-crime": Fingerprint,
  "prestige-drama": Award,
  "high-stakes": Swords,
};

const DEFAULT_VISIBLE_GROUPS = 2;

interface MoodPickerProps {
  selected: string[];
  onToggle: (id: string) => void;
  disabled: boolean;
}

export function MoodPicker({ selected, onToggle, disabled }: MoodPickerProps) {
  const [expanded, setExpanded] = useState(false);
  const visibleGroups = expanded ? MOOD_GROUPS : MOOD_GROUPS.slice(0, DEFAULT_VISIBLE_GROUPS);
  const totalReached = selected.length >= MAX_MOOD_SELECTIONS;

  return (
    <div className="mt-4 space-y-3 flex flex-col gap-3 sm:gap-1 px-2">
      {visibleGroups.map((group) => {
        const options = MOOD_OPTIONS.filter((o) => o.group === group.id);
        const groupCount = options.filter((o) => selected.includes(o.id)).length;
        const groupFull = groupCount >= group.maxSelected;

        return (
          <div key={group.id} className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wide w-full sm:w-auto sm:min-w-[90px]">
              {group.label}
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {options.map(({ id, label }) => {
                const isSelected = selected.includes(id);
                const Icon = ICONS[id] ?? Sparkles;
                const isLocked = !isSelected && (totalReached || groupFull);

                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onToggle(id)}
                    disabled={disabled || isLocked}
                    aria-pressed={isSelected}
                    className={cn(
                      "inline-flex items-center gap-1.5 text-xs sm:text-sm border rounded-full",
                      "px-3 py-1.5 sm:px-3.5 transition-colors",
                      "disabled:opacity-40",
                      isSelected
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 hover:bg-accent"
                    )}
                  >
                    <Icon className="size-3.5" />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      <ExpandToggle
        expanded={expanded}
        onToggle={() => setExpanded((v) => !v)}
        expandLabel="More ideas"
        collapseLabel="Show less"
      />
    </div>
  );
}