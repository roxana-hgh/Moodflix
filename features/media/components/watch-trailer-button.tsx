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
      <Button onClick={() => setOpen(true)} variant="secondary" className="gap-2 rounded-full">
        <Play className="h-4 w-4 fill-current" /> Watch Trailer
      </Button>

      <YoutubeDialog open={open} onOpenChange={setOpen} videoKey={trailerKey} title={`${title} — Trailer`} />
    </>
  );
}