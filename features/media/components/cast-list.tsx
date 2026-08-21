"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { tmdbImageUrl } from "@/utils/image";
import type { CastMember } from "../types";

const PREVIEW_COUNT = 12;

export function CastList({ cast }: { cast: CastMember[] }) {
  const [expanded, setExpanded] = useState(false);
  if (cast.length === 0) return null;

  const visible = expanded ? cast : cast.slice(0, PREVIEW_COUNT);
  const hasMore = cast.length > PREVIEW_COUNT;

  return (
    <div>
      <h2 className="mb-4 text-sm font-semibold text-primary">Cast</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {visible.map((member) => (
          <div key={member.id} className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/50 p-2">
            <div className="relative size-10 sm:size-12 shrink-0 overflow-hidden rounded-full bg-muted">
              {member.profilePath ? (
                <Image
                  src={tmdbImageUrl(member.profilePath)}
                  alt={member.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-[10px] text-muted-foreground">
                  {member.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs sm:text-sm font-medium text-foreground">{member.name}</p>
              <p className="truncate text-[10px] sm:text-xs text-muted-foreground">{member.character}</p>
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-4 flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          {expanded ? "Show less" : `Show all ${cast.length} cast members`}
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </button>
      )}
    </div>
  );
}