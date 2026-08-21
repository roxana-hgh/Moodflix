import type { ElementType, ReactNode } from "react";
import { Calendar, Tv, Globe2, Languages, Clock, ListVideo, ExternalLink, CircleCheck, Users } from "lucide-react";
import type { MediaDetail } from "../types";

function InfoRow({ icon: Icon, label, value }: { icon: ElementType; label: string; value: ReactNode }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/60 py-3 text-xs sm:text-sm last:border-0">
      <span className="flex items-start gap-2 text-muted-foreground">
        <Icon className="h-4 w-4 text-primary pt-1" />
        {label}
      </span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  );
}

export function MediaInfoGrid({ detail }: { detail: MediaDetail }) {
  const {
    mediaType, releaseDate, networks, spokenLanguages, productionCountries,
    runtime, numberOfSeasons, numberOfEpisodes, status, homepage, creators
  } = detail;

  return (
    <div className="rounded-2xl border border-border/60 bg-card/50 p-5 sm:p-6">
      <h2 className="mb-3 text-sm font-semibold text-primary">More information</h2>
      <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
        <InfoRow
          icon={Calendar}
          label="Release date"
          value={
            releaseDate
              ? new Date(releaseDate).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
              : null
          }
        />
        {mediaType === "tv" && (
          <InfoRow icon={Tv} label="Networks" value={networks.join(", ") || null} />
        )}
        <InfoRow icon={Languages} label="Languages" value={spokenLanguages.join(", ") || null} />
        <InfoRow icon={Globe2} label="Production countries" value={productionCountries.join(", ") || null} />
        <InfoRow
          icon={Users}
          label={mediaType === "tv" ? "Created by" : "Director"}
          value={creators.length ? creators.map((c) => c.name).join(", ") : null}
        />
        <InfoRow icon={Clock} label="Duration" value={runtime ? `${runtime} min` : null} />
        {mediaType === "tv" && (
          <InfoRow
            icon={ListVideo}
            label="Seasons / Episodes"
            value={numberOfSeasons ? `${numberOfSeasons} / ${numberOfEpisodes}` : null}
          />
        )}
        <InfoRow icon={CircleCheck} label="Status" value={status} />
        {/* {homepage && (
          <InfoRow
            icon={ExternalLink}
            label="Homepage"
            value={
              <a href={homepage} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                Visit
              </a>
            }
          />
        )} */}
      </div>
    </div>
  );
}