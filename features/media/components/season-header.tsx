import Image from "next/image";
import { tmdbImageUrl } from "@/utils/image";
import type { SeasonDetail } from "../types";

export function SeasonHeader({ season }: { season: SeasonDetail }) {
  return (
    <div className="mb-8 flex gap-5">
      <div className="relative aspect-[2/3] w-28 shrink-0 overflow-hidden rounded-xl bg-muted sm:w-36">
        {season.posterPath && (
          <Image
            src={tmdbImageUrl(season.posterPath, "w342")}
            alt={season.name}
            fill
            className="object-cover"
          />
        )}
      </div>
      <div className="flex flex-col justify-end">
        <p className="text-xs font-medium text-muted-foreground">
          {season.episodes.length} episodes
          {season.airDate && ` · ${new Date(season.airDate).getFullYear()}`}
        </p>
        <h1 className="mt-1 text-xl font-semibold sm:text-2xl">{season.name}</h1>
        {season.overview && (
          <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{season.overview}</p>
        )}
      </div>
    </div>
  );
}