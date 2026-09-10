"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

const THINKING_MESSAGES = [
  "Reading your mood…",
  "Matching genres…",
  "Digging through the archives…",
  "Curating your picks…",
];

export function MoodLoadingState() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % THINKING_MESSAGES.length);
    }, 1400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <Sparkles className="size-6 text-primary animate-pulse" />
      <p className="text-sm text-muted-foreground transition-all duration-300">
        {THINKING_MESSAGES[index]}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 w-full mt-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="aspect-[2/3] rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    </div>
  );
}