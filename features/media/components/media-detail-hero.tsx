import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, ListPlus, Heart, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { tmdbImageUrl } from "@/utils/image";
import { RatingRing } from "./rating-ring";
import { QuickListButton } from "@/features/lists/components/quick-list-button";
import { AddToListDialog } from "@/features/lists/components/add-to-list-dialog";
import type { MediaDetail } from "../types";

interface MediaDetailHeroProps {
  detail: MediaDetail;
  initialFavorited?: boolean;
  initialWatchlisted?: boolean;
}

export function MediaDetailHero({
  detail,
  initialFavorited = false,
  initialWatchlisted = false,
}: MediaDetailHeroProps) {
  const {
    id,
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

  const outlineToggleClass =
    "rounded-full data-[active=true]:border-primary data-[active=true]:text-primary data-[active=true]:bg-primary/10";

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
        <div className="relative  aspect-[2/3] w-32 sm:w-40 shrink-0 overflow-hidden rounded-xl border border-white/10 shadow-2xl shadow-black/50 sm:block lg:w-52">
          {posterPath ? (
            <Image src={tmdbImageUrl(posterPath, "w500")} alt={title} fill className="object-cover" />
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
            {tagline && <p className="mt-1 text-sm italic text-muted-foreground">{tagline}</p>}
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
                <Link key={genre.id} href={mediaType === "movie" ? `/movies?genre=${genre.id}` : `/shows?genre=${genre.id}`}>
                  <Badge className="rounded-full bg-white/10 text-foreground hover:bg-white/15">
                    {genre.id && genre.name ? genre.name : "Unknown"}
                  </Badge>
                </Link>
              ))}
            </div>
          )}

          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground ">{overview}</p>

          <div className="flex flex-wrap gap-2 pt-1">
            <AddToListDialog
              tmdbId={id}
              mediaType={mediaType}
              title={title}
              posterPath={posterPath}
              releaseYear={releaseYear}
              trigger={
                <Button className="gap-2 rounded-full">
                  <ListPlus className="h-4 w-4" /> Add to List
                </Button>
              }
            />

            <QuickListButton
              listType="FAVORITE"
              tmdbId={id}
              mediaType={mediaType}
              title={title}
              posterPath={posterPath}
              releaseYear={releaseYear}
              initialActive={initialFavorited}
              variant="outline"
              size="icon"
              className={outlineToggleClass}
              label="Add to favorites"
              activeLabel="Remove from favorites"
              icon={<Heart className="h-4 w-4" />}
              activeIcon={<Heart className="h-4 w-4 fill-primary text-primary" />}
            />

            <QuickListButton
              listType="WATCHLIST"
              tmdbId={id}
              mediaType={mediaType}
              title={title}
              posterPath={posterPath}
              releaseYear={releaseYear}
              initialActive={initialWatchlisted}
              variant="outline"
              size="icon"
              className={outlineToggleClass}
              label="Add to watch later"
              activeLabel="Remove from watch later"
              icon={<Bookmark className="h-4 w-4" />}
              activeIcon={<Bookmark className="h-4 w-4 fill-primary text-primary" />}
            />
          </div>
        </div>
      </div>
    </section>
  );
}