"use client";

/**
 * components/media/media-carousel.tsx
 *
 * Bare utility carousel — no title, no data-fetching opinions. Pass your
 * already-mapped cards in as `children`; each child gets wrapped in a
 * CarouselItem with the responsive sizing/gap applied.
 *
 * Built on components/ui/carousel.tsx (shadcn, wraps embla-carousel-react).
 * Do NOT edit that primitive — extend behavior here instead.
 */

import * as React from "react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";


type ResponsiveBasis = {
  base?: 1 | 2 | 3 | 4 | 5 | 6; // items visible on mobile (default 2)
  sm?: 1 | 2 | 3 | 4 | 5 | 6;
  md?: 1 | 2 | 3 | 4 | 5 | 6;
  lg?: 1 | 2 | 3 | 4 | 5 | 6;
  xl?: 1 | 2 | 3 | 4 | 5 | 6;
};

interface MediaCarouselProps {
  children: React.ReactNode;
  /** How many cards are visible at each breakpoint. */
  itemsPerView?: ResponsiveBasis;
  /** Gap between cards */
  gap?: "sm" | "md" | "lg";
  /** Loop back to the start when reaching the end */
  loop?: boolean;
  /** Enable autoplay; pass ms delay or true for default 4000ms */
  autoplay?: boolean | number;
  /** Hide the prev/next arrow buttons (still swipeable/draggable) */
  hideControls?: boolean;
  orientation?: "horizontal" | "vertical";
  className?: string;
  itemClassName?: string;
}

const DEFAULT_BASIS: Required<ResponsiveBasis> = {
  base: 2,
  sm: 3,
  md: 4,
  lg: 5,
  xl: 6,
};

// Tailwind's JIT scanner only picks up class names it can find as literal
// text in source — building "basis-1/${n}" at runtime would get purged in
// production. Static map keeps every class spelled out.
const BASIS_MAP: Record<keyof ResponsiveBasis, Record<number, string>> = {
  base: { 1: "basis-full", 2: "basis-1/2", 3: "basis-1/3", 4: "basis-1/4", 5: "basis-1/5", 6: "basis-1/6" },
  sm: { 1: "sm:basis-full", 2: "sm:basis-1/2", 3: "sm:basis-1/3", 4: "sm:basis-1/4", 5: "sm:basis-1/5", 6: "sm:basis-1/6" },
  md: { 1: "md:basis-full", 2: "md:basis-1/2", 3: "md:basis-1/3", 4: "md:basis-1/4", 5: "md:basis-1/5", 6: "md:basis-1/6" },
  lg: { 1: "lg:basis-full", 2: "lg:basis-1/2", 3: "lg:basis-1/3", 4: "lg:basis-1/4", 5: "lg:basis-1/5", 6: "lg:basis-1/6" },
  xl: { 1: "xl:basis-full", 2: "xl:basis-1/2", 3: "xl:basis-1/3", 4: "xl:basis-1/4", 5: "xl:basis-1/5", 6: "xl:basis-1/6" },
};

const GAP_MARGIN_MAP: Record<"sm" | "md" | "lg", string> = {
  sm: "-ml-2",
  md: "-ml-4",
  lg: "-ml-6",
};

const GAP_PADDING_MAP: Record<"sm" | "md" | "lg", string> = {
  sm: "pl-2",
  md: "pl-4",
  lg: "pl-6",
};

function basisClasses(itemsPerView: ResponsiveBasis) {
  const merged = { ...DEFAULT_BASIS, ...itemsPerView };
  return cn(
    BASIS_MAP.base[merged.base],
    BASIS_MAP.sm[merged.sm],
    BASIS_MAP.md[merged.md],
    BASIS_MAP.lg[merged.lg],
    BASIS_MAP.xl[merged.xl]
  );
}

export function MediaCarousel({
  children,
  itemsPerView = {},
  gap = "md",
  loop = false,
  autoplay = false,
  hideControls = false,
  orientation = "horizontal",
  className,
  itemClassName,
}: MediaCarouselProps) {
  const plugins = React.useMemo(() => {
    if (!autoplay) return [];
    const delay = typeof autoplay === "number" ? autoplay : 4000;
    return [Autoplay({ delay, stopOnInteraction: true })];
  }, [autoplay]);

  const childArray = React.Children.toArray(children);
  if (!childArray.length) return null;

  return (
    <Carousel
      opts={{ align: "start", loop }}
      orientation={orientation}
      plugins={plugins}
      className={cn("w-full", className)}
    >
      <CarouselContent
        className={cn(orientation === "horizontal" ? GAP_MARGIN_MAP[gap] : "-mt-4")}
      >
        {childArray.map((child, index) => (
          <CarouselItem
            key={index}
            className={cn(
              orientation === "horizontal" ? GAP_PADDING_MAP[gap] : "pt-4",
              basisClasses(itemsPerView),
              itemClassName
            )}
          >
            {child}
          </CarouselItem>
        ))}
      </CarouselContent>

      {!hideControls && (
        <>
          <CarouselPrevious className="left-2 hidden sm:flex" />
          <CarouselNext className="right-2 hidden sm:flex" />
        </>
      )}
    </Carousel>
  );
}