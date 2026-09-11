"use client";

import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExpandToggleProps {
  expanded: boolean;
  onToggle: () => void;
  expandLabel: string;
  collapseLabel: string;
  className?: string;
}

export function ExpandToggle({ expanded, onToggle, expandLabel, collapseLabel, className }: ExpandToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors",
        className
      )}
    >
      {expanded ? collapseLabel : expandLabel}
      <ChevronDown className={cn("size-3.5 transition-transform", expanded && "rotate-180")} />
    </button>
  );
}