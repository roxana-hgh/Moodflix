import Image from "next/image";
import Link from "next/link";
import { tmdbImageUrl } from "@/utils/image";
import type { ReactNode } from "react";

interface MediaCardCompactProps {
  id: number;
  title: string;
  posterPath: string | null;
  releaseYear: string | null;
  mediaType: "movie" | "tv";
  actions?: ReactNode;
}

export function MediaCardCompact({
  id,
  title,
  posterPath,
  releaseYear,
  mediaType,
  actions,
}: MediaCardCompactProps) {
  return (
    <div className="group relative h-full">
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-muted">
        <Image
          src={tmdbImageUrl(posterPath)}
          alt={title}
          fill
          sizes="(max-width: 768px) 40vw, 200px"
          className="object-cover transition-transform duration-200 group-hover:scale-105"
        />
        {actions && (
          <div className="absolute right-2 top-2 z-10 flex flex-col gap-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            {actions}
          </div>
        )}
      </div>

      <div className="mt-2 space-y-1">
        <h3 className="line-clamp-1 text-sm font-medium">{title}</h3>
        {releaseYear && <p className="text-xs text-muted-foreground">{releaseYear}</p>}
      </div>

      <Link href={`/${mediaType}/${id}`} className="absolute inset-0 z-0" aria-label={title} />
    </div>
  );
}