"use client";

import Image from "next/image";
import { Clock, Star } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import type { EpisodeSummary } from "../types";
import { tmdbImageUrl } from "@/utils/image";

export function EpisodeAccordion({ episodes }: { episodes: EpisodeSummary[] }) {
  return (
    <Accordion type="single" collapsible className="flex flex-col gap-2">
      {episodes.map((ep) => (
        <AccordionItem
          key={ep.id}
          value={String(ep.id)}
          className="rounded-xl border border-border/60 bg-card/50 px-3"
        >
          <AccordionTrigger className="gap-3 py-3 hover:no-underline [&>svg]:shrink-0">
            <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
              {ep.stillPath && (
                <Image
                  src={tmdbImageUrl(ep.stillPath)}
                  alt={ep.name}
                  fill
                  className="object-cover"
                />
              )}
            </div>
            <div className="flex flex-1 flex-col items-start text-left">
              <span className="text-xs font-medium text-muted-foreground">
                Episode {ep.episodeNumber}
              </span>
              <span className="text-sm font-medium">{ep.name}</span>
              <span className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                {ep.airDate && <span>{new Date(ep.airDate).toLocaleDateString()}</span>}
                {ep.runtime && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {ep.runtime}m
                  </span>
                )}
                {ep.voteAverage > 0 && (
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-primary text-primary" /> {ep.voteAverage.toFixed(1)}
                  </span>
                )}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4 text-sm text-muted-foreground">
            {ep.overview || "No overview available."}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}