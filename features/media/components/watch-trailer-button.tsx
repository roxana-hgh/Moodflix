"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { YoutubeDialog } from "./youtube-dialog";

interface WatchTrailerButtonProps {
  trailerKey: string;
  title: string;
}

export function WatchTrailerButton({ trailerKey, title }: WatchTrailerButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="secondary" className="gap-1 rounded-full w-fit">
        <Play className="h-3.5 w-3.5 fill-current" />  <span className="text-xs sm:text-sm">Watch Trailer</span>
      </Button>

      <YoutubeDialog open={open} onOpenChange={setOpen} videoKey={trailerKey} title={`${title} — Trailer`} />
    </>
  );
}