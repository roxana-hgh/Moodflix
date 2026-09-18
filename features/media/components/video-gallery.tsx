"use client";

import { useCallback, useState } from "react";
import { Play } from "lucide-react";
import { YoutubeDialog } from "./youtube-dialog";
import type { Video } from "../types";

interface VideoGalleryProps {
  videos: Video[];
  title: string;
}

function youtubeThumbnail(key: string) {
  return `https://img.youtube.com/vi/${key}/hqdefault.jpg`;
}

export function VideoGallery({ videos, title }: VideoGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const open = activeIndex !== null;

  const close = useCallback(() => setActiveIndex(null), []);

  const showPrev = useCallback(() => {
    setActiveIndex((i) =>
      i === null ? i : (i - 1 + videos.length) % videos.length
    );
  }, [videos.length]);

  const showNext = useCallback(() => {
    setActiveIndex((i) =>
      i === null ? i : (i + 1) % videos.length
    );
  }, [videos.length]);

  if (videos.length === 0) return null;

  const active = activeIndex !== null ? videos[activeIndex] : null;

  return (
    <div>
      <h2 className="mb-4 text-sm font-semibold text-primary">
        Videos
      </h2>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {videos.map((video, i) => (
          <button
            key={video.id}
            onClick={() => setActiveIndex(i)}
            className="
              group relative h-32 w-56 shrink-0
              overflow-hidden rounded-lg
              bg-black
              sm:h-36 sm:w-64
            "
          >
            {/* Thumbnail */}
            <img
              src={youtubeThumbnail(video.key)}
              alt=""
              className="
                h-full w-full object-cover
                transition-transform duration-300
                group-hover:scale-105
              "
            />

            {/* Minimal readability overlay */}
            <div
              className="
                absolute inset-0
                bg-gradient-to-t
                from-black/90 via-black/15 to-transparent
              "
            />

            {/* Type */}
           {video.type !== "Trailer" && (
              <span
                className="
                  absolute left-2 top-2
                  rounded-md
                  bg-black/45
                  px-1.5 py-1
                  text-[9px] font-semibold uppercase
                  tracking-wider text-white
                  backdrop-blur-sm
                "
              >
                {video.type}
              </span>
            )}

            {/* Play */}
            <span
              className="
                absolute inset-0
                flex items-center justify-center
              "
            >
              <span
                className="
                  flex h-10 w-10 items-center justify-center
                  rounded-full
                  bg-white/75
                  shadow-lg
                  transition-all duration-200
                  group-hover:scale-110
                  group-hover:bg-white
                "
              >
                <Play className="ml-0.5 h-4 w-4 fill-black text-black" />
              </span>
            </span>

            {/* Title */}
            <span
              className="
                absolute bottom-2 left-2 right-2
                line-clamp-1
                text-left
                text-xs font-medium
                text-white
                drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]
              "
            >
              {video.name}
            </span>
          </button>
        ))}
      </div>

      <YoutubeDialog
        open={open}
        onOpenChange={(next) => !next && close()}
        videoKey={active?.key ?? null}
        title={active ? `${title} — ${active.name}` : title}
        onPrev={videos.length > 1 ? showPrev : undefined}
        onNext={videos.length > 1 ? showNext : undefined}
        counter={
          activeIndex !== null
            ? `${activeIndex + 1} / ${videos.length}`
            : undefined
        }
      />
    </div>
  );
}