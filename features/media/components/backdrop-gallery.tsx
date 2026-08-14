"use client";

import Image from "next/image";
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { tmdbImageUrl } from "@/utils/image";

export function BackdropGallery({ backdrops, title }: { backdrops: string[]; title: string }) {
  const [active, setActive] = useState<string | null>(null);

  if (backdrops.length === 0) return null;

  return (
    <div>
      <h2 className="mb-4 text-sm font-semibold text-primary">Images</h2>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {backdrops.map((path) => (
          <button
            key={path}
            onClick={() => setActive(path)}
            className="relative h-28 w-48 shrink-0 overflow-hidden rounded-lg border border-border/60 transition-opacity hover:opacity-80 sm:h-32 sm:w-56"
          >
            <Image src={tmdbImageUrl(path)} alt=""  width={200} height={100} className="object-cover block w-full h-full" />
          </button>
        ))}
      </div>

      <Dialog open={!!active} onOpenChange={(open) => !open && setActive(null)}>
        <DialogContent className="max-w-4xl border-none bg-transparent p-0 shadow-none">
          <DialogTitle className="sr-only">{title} image</DialogTitle>
          {active && (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg">
              <Image src={tmdbImageUrl(active, "original")} alt="" width={600} height={400} className="object-contain" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}