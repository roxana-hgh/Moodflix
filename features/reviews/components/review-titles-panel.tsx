import Image from "next/image";
import Link from "next/link";
import { tmdbImageUrl } from "@/utils/image";
import { mediaHref, type ReviewMediaItem } from "../types";

export function ReviewTitlesPanel({ media }: { media: ReviewMediaItem[] }) {
  return (
    <section className="rounded-2xl border bg-card p-3">
      <h2 className="mb-2 px-1 text-sm font-semibold">
        In this list <span className="font-normal text-muted-foreground">· {media.length}</span>
      </h2>
      <ol className="flex max-h-72 flex-col gap-1 overflow-y-auto lg:max-h-[420px]">
        {media.map((item, index) => (
          <li key={`${item.mediaType}-${item.tmdbId}`}>
            <Link
              href={mediaHref(item)}
              className="flex items-center gap-3 rounded-lg p-1.5 transition-colors hover:bg-accent/50"
            >
              <span className="w-5 shrink-0 text-center text-xs font-semibold tabular-nums text-muted-foreground">
                {index + 1}
              </span>
              <div className="relative h-12 w-8 shrink-0 overflow-hidden rounded bg-muted">
                {item.posterPath && (
                  <Image
                    src={tmdbImageUrl(item.posterPath)}
                    alt={item.title}
                    fill
                    sizes="32px"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.releaseYear ?? "—"}</p>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}