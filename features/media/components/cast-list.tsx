import Image from "next/image";
import { tmdbImageUrl } from "@/utils/image";
import type { CastMember } from "../types";

export function CastList({ cast }: { cast: CastMember[] }) {
  if (cast.length === 0) return null;

  return (
    <div>
      <h2 className="mb-4 text-sm font-semibold text-primary">Cast</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {cast.map((member) => (
          <div key={member.id} className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/50 p-2">
            <div className="relative size-10 sm:size-12 shrink-0 overflow-hidden rounded-full bg-muted">
              {member.profilePath ? (
                <Image
                  src={tmdbImageUrl(member.profilePath)}
                  alt={member.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-[10px] text-muted-foreground">
                  {member.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs sm:text-sm font-medium text-foreground">{member.name}</p>
              <p className="truncate text-[10px] sm:text-xs text-muted-foreground">{member.character}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}