"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";


const COLLAPSED_HEIGHT = 96; // ~4 lines

export function PersonBio({ biography }: { biography: string }) {
  const [expanded, setExpanded] = useState(false);
  const [needsToggle, setNeedsToggle] = useState(false);
  const contentRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      setNeedsToggle(contentRef.current.scrollHeight > COLLAPSED_HEIGHT + 8);
    }
  }, [biography]);

  return (
    <div>
      <h2 className="mb-2 text-lg text-start font-semibold">Biography</h2>
      <div className="relative">
        <p
          ref={contentRef}
          className={cn(
            "whitespace-pre-line text-start text-sm leading-relaxed text-muted-foreground transition-[max-height] duration-300",
            !expanded && "overflow-hidden"
          )}
          style={!expanded ? { maxHeight: COLLAPSED_HEIGHT } : undefined}
        >
          {biography}
        </p>
        {!expanded && needsToggle && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-background to-transparent" />
        )}
      </div>
      {needsToggle && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          {expanded ? "Show less" : "Read more"}
          <ChevronDown className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")} />
        </button>
      )}
    </div>
  );
}