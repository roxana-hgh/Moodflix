"use client";

import { useState } from "react";
import {
    Heart,
    Gem,
    CloudRain,
    Brain,
    TreePine,
    Flame,
    Ghost,
    Sparkles,
    Users,
    Moon,
    Soup,
    PartyPopper,
    Clock,
    Swords,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ExpandToggle } from "@/components/shared/expand-toggle";

interface QuickMood {
    label: string;
    icon: typeof Heart;
}

interface QuickMoodCategory {
    category: string;
    moods: QuickMood[];
}

const CATEGORIES: QuickMoodCategory[] = [
    {
        category: "Mood",
        moods: [
            { label: "cozy rom-com", icon: Heart },
            { label: "something to cry to", icon: CloudRain },
            { label: "feel-good and light", icon: Sparkles },
            { label: "dark and twisted", icon: Ghost },
        ],
    },
    {
        category: "Genre kick",
        moods: [
            { label: "heist thriller", icon: Gem },
            { label: "mind-bending sci-fi", icon: Brain },
            { label: "epic fantasy battles", icon: Swords },
            { label: "slow-burn mystery", icon: TreePine },
        ],
    },
    {
        category: "Occasion",
        moods: [
            { label: "date night pick", icon: Heart },
            { label: "family movie night", icon: Users },
            { label: "background while cooking", icon: Soup },
            { label: "weekend binge-worthy series", icon: Clock },
        ],
    },
    {
        category: "Vibe",
        moods: [
            { label: "nostalgic 90s throwback", icon: Moon },
            { label: "guilty pleasure trash", icon: PartyPopper },
            { label: "high-stakes and intense", icon: Flame },
        ],
    },
];

const DEFAULT_VISIBLE_CATEGORIES = 2;

interface QuickMoodSuggestionsProps {
    onSelect: (mood: string) => void;
    disabled: boolean;
}

export function QuickMoodSuggestions({ onSelect, disabled }: QuickMoodSuggestionsProps) {
    const [expanded, setExpanded] = useState(false);
    const visibleCategories = expanded ? CATEGORIES : CATEGORIES.slice(0, DEFAULT_VISIBLE_CATEGORIES);

    return (
        <div className="mt-4 space-y-3 flex flex-col gap-3 sm:gap-1 px-2">
            {visibleCategories.map(({ category, moods }) => (
                <div key={category} className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wide w-full sm:w-auto sm:min-w-[90px]">
                        {category}
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                        {moods.map(({ label, icon: Icon }) => (
                        <button
                            key={label}
                            type="button"
                            onClick={() => onSelect(label)}
                            disabled={disabled}
                            className={cn(
                                "inline-flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground border border-border rounded-full",
                                "px-3 py-1.5 sm:px-3.5 hover:text-foreground hover:border-foreground/30 hover:bg-accent transition-colors",
                                "disabled:opacity-40"
                            )}
                        >
                            <Icon className="size-3.5" />
                            {label}
                        </button>
                    ))}
                    </div>
                </div>
            ))}

            <ExpandToggle
                expanded={expanded}
                onToggle={() => setExpanded((v) => !v)}
                expandLabel="More ideas"
                collapseLabel="Show less"
            />
        </div>
    );
}