"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { tmdbImageUrl } from "@/utils/image";

interface BackdropGalleryProps {
  backdrops: string[];
  title: string;
}

export function BackdropGallery({ backdrops, title }: BackdropGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [imageLoading, setImageLoading] = useState(true);
  const open = activeIndex !== null;

  const close = useCallback(() => setActiveIndex(null), []);
  const showPrev = useCallback(() => {
    setImageLoading(true);
    setActiveIndex((i) => (i === null ? i : (i - 1 + backdrops.length) % backdrops.length));
  }, [backdrops.length]);
  const showNext = useCallback(() => {
    setImageLoading(true);
    setActiveIndex((i) => (i === null ? i : (i + 1) % backdrops.length));
  }, [backdrops.length]);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, showPrev, showNext]);

  if (backdrops.length === 0) return null;

  const active = activeIndex !== null ? backdrops[activeIndex] : null;

  function handleThumbnailClick(i: number) {
    setImageLoading(true);
    setActiveIndex(i);
  }

  return (
    <div>
      <h2 className="mb-4 text-sm font-semibold text-primary">Images</h2>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {backdrops.map((path, i) => (
          <button
            key={path}
            onClick={() => handleThumbnailClick(i)}
            className="relative h-28 w-48 shrink-0 overflow-hidden rounded-lg border border-border/60 transition-opacity hover:opacity-80 sm:h-32 sm:w-56"
          >
            <Image
              src={tmdbImageUrl(path)}
              alt=""
              width={300}
              height={169}
              className="block h-full w-full object-cover"
            />
          </button>
        ))}
      </div>

      <DialogPrimitive.Root open={open} onOpenChange={(next) => !next && close()}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

          <DialogPrimitive.Content
            onOpenAutoFocus={(e) => e.preventDefault()}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 p-4 outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          >
            <DialogPrimitive.Title className="sr-only">{title} image</DialogPrimitive.Title>

            <DialogPrimitive.Close className="absolute right-3 top-3 z-10 rounded-full bg-white/10 p-2 text-white/90 backdrop-blur-sm transition-colors hover:bg-white/20 sm:right-4 sm:top-4">
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>

            {/* Desktop/tablet: floating side arrows over the image */}
            {backdrops.length > 1 && (
              <>
                <button
                  onClick={showPrev}
                  className="absolute left-4 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white/10 p-2 text-white/90 backdrop-blur-sm transition-colors hover:bg-white/20 sm:flex"
                >
                  <ChevronLeft className="h-6 w-6" />
                  <span className="sr-only">Previous image</span>
                </button>
                <button
                  onClick={showNext}
                  className="absolute right-4 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white/10 p-2 text-white/90 backdrop-blur-sm transition-colors hover:bg-white/20 sm:flex"
                >
                  <ChevronRight className="h-6 w-6" />
                  <span className="sr-only">Next image</span>
                </button>
              </>
            )}

            {/* Fixed-footprint stage: size never depends on the current image, so nothing collapses on swap. */}
            <div className="relative flex h-[65vh] w-full max-w-6xl items-center justify-center sm:h-[75vh]">
              <div
                className={`absolute inset-8 animate-pulse rounded-lg bg-white/5 transition-opacity duration-150 ${
                  imageLoading ? "opacity-100" : "opacity-0"
                }`}
              />

              {imageLoading && (
                <div className="absolute z-10 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-white/70" />
                </div>
              )}

              {active && (
                <Image
                  key={active}
                  src={tmdbImageUrl(active, "original")}
                  alt={`${title} image ${activeIndex! + 1} of ${backdrops.length}`}
                  fill
                  sizes="95vw"
                  className={`rounded-lg object-contain shadow-2xl shadow-black/50 transition-opacity duration-200 ${
                    imageLoading ? "opacity-0" : "opacity-100"
                  }`}
                  onLoad={() => setImageLoading(false)}
                  priority
                />
              )}
            </div>

            {/* Mobile: prev/next moved off the image into a control row with the counter */}
            {backdrops.length > 1 ? (
              <div className="flex items-center gap-5 sm:hidden">
                <button
                  onClick={showPrev}
                  className="rounded-full bg-white/10 p-2.5 text-white/90 backdrop-blur-sm transition-colors hover:bg-white/20"
                >
                  <ChevronLeft className="h-5 w-5" />
                  <span className="sr-only">Previous image</span>
                </button>
                <span className="text-xs font-medium text-white/70">
                  {activeIndex! + 1} / {backdrops.length}
                </span>
                <button
                  onClick={showNext}
                  className="rounded-full bg-white/10 p-2.5 text-white/90 backdrop-blur-sm transition-colors hover:bg-white/20"
                >
                  <ChevronRight className="h-5 w-5" />
                  <span className="sr-only">Next image</span>
                </button>
              </div>
            ) : null}

            {/* Desktop/tablet: counter only, no buttons here since arrows float on the sides */}
            {backdrops.length > 1 && (
              <div className="hidden text-xs font-medium text-white/70 sm:block">
                {activeIndex! + 1} / {backdrops.length}
              </div>
            )}
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </div>
  );
}