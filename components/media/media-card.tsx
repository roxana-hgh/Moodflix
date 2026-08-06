import Image from 'next/image';
import Link from 'next/link';
import { Star, Heart, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { tmdbImageUrl } from '@/utils/image';
import type { MediaCardItem } from '@/types/media';

export function MediaCard({
  id,
  title,
  posterPath,
  voteAverage,
  releaseYear,
  overview,
  mediaType,
}: MediaCardItem) {
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

        {overview && (
          <div className="absolute inset-0 flex items-end bg-gradient-to-t from-background/95 via-background/70 to-transparent p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <p className="line-clamp-6 text-xs text-muted-foreground">{overview}</p>
          </div>
        )}

        {/* Placeholder action buttons — not wired up yet */}
        <div className="absolute right-2 top-2 z-10 flex flex-col gap-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <Button
            type="button"
            size="icon"
            variant="secondary"
            className="h-7 w-7 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
          >
            <Heart className="h-3.5 w-3.5" />
            <span className="sr-only">Add to favorites</span>
          </Button>
          <Button
            type="button"
            size="icon"
            variant="secondary"
            className="h-7 w-7 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="sr-only">Add to list</span>
          </Button>
        </div>
      </div>

      <div className="mt-2 space-y-1">
        <h3 className="line-clamp-1 text-sm font-medium">{title}</h3>

        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1 font-medium text-primary">
            <Star className="h-3 w-3 fill-primary text-primary" />
            {voteAverage.toFixed(1)}
            <span className="font-normal text-muted-foreground">/10</span>
          </span>

          {releaseYear && (
            <>
              <span className="text-muted-foreground">|</span>
              <span className="text-muted-foreground">{releaseYear}</span>
            </>
          )}
        </div>
      </div>

      <Link
        href={`/${mediaType}/${id}`}
        className="absolute inset-0 z-0"
        aria-label={title}
      />
    </div>
  );
}