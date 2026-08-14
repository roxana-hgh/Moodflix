import Image from "next/image";
import { Calendar, Clock, ListPlus, Heart, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { tmdbImageUrl } from "@/utils/image";
import { RatingRing } from "./rating-ring";
import type { MediaDetail } from "../types";

interface MediaDetailHeroProps {
  detail: MediaDetail;
}

export function MediaDetailHero({ detail }: MediaDetailHeroProps) {
  const {
    title,
    tagline,
    overview,
    backdropPath,
    posterPath,
    releaseYear,
    genres,
    voteAverage,
    runtime,
    mediaType,
    numberOfSeasons,
    status,
  } = detail;

  return (
    <section className="relative">
      <div className="absolute inset-0 -z-10 h-[75vh] min-h-[420px] overflow-hidden">
        {backdropPath && (
          <Image
            src={tmdbImageUrl(backdropPath, "original")}
            alt=""
            fill
            priority
            className="object-cover object-top"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent" />
      </div>

      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-10 pt-[32vh] sm:flex-row sm:items-end sm:pt-[30vh] sm:px-6 lg:pt-[28vh] lg:min-h-[95dvh]">
        <div className="relative hidden aspect-[2/3] w-40 shrink-0 overflow-hidden rounded-xl border border-white/10 shadow-2xl shadow-black/50 sm:block lg:w-52">
          {posterPath ? (
            <Image
              src={tmdbImageUrl(posterPath, "w500")}
              alt={title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-muted text-xs text-muted-foreground">
              No poster
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              {title}
            </h1>
            {tagline && (
              <p className="mt-1 text-sm italic text-muted-foreground">{tagline}</p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <RatingRing size={48} voteAverage={voteAverage} />
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {releaseYear || "TBA"}
            </div>
            {mediaType === "movie" && runtime ? (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {runtime} min
              </div>
            ) : mediaType === "tv" && numberOfSeasons ? (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {numberOfSeasons} season{numberOfSeasons > 1 ? "s" : ""}
              </div>
            ) : null}
            <Badge variant="outline" className="border-white/20 text-xs font-normal text-muted-foreground">
              {status}
            </Badge>
          </div>

          {genres.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {genres.map((genre) => (
                <Badge key={genre} className="rounded-full bg-white/10 text-foreground hover:bg-white/15">
                  {genre}
                </Badge>
              ))}
            </div>
          )}

          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {overview}
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            <Button className="gap-2 rounded-full">
              <ListPlus className="h-4 w-4" /> Add to List
            </Button>
            <Button variant="outline" size="icon" className="rounded-full">
              <Heart className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full">
              <Bookmark className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}