"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useIsInLibrary, useToggleQuickList } from "../hooks";
import { toListMediaType, type SystemListType } from "../types";

interface QuickListButtonProps {
  listType: SystemListType;
  tmdbId: number;
  mediaType: "movie" | "tv";
  title: string;
  posterPath: string | null;
  releaseYear: string | null;
  icon: ReactNode;
  activeIcon?: ReactNode;
  label: string;
  activeLabel?: string;
  className?: string;
  variant?: "secondary" | "outline";
  size?: "default" | "icon";
}

/** Toggles a title in one of the viewer's system lists. State comes from the viewer library. */
export function QuickListButton({
  listType,
  tmdbId,
  mediaType,
  title,
  posterPath,
  releaseYear,
  icon,
  activeIcon,
  label,
  activeLabel,
  className,
  variant = "secondary",
  size = "icon",
}: QuickListButtonProps) {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const listMediaType = toListMediaType(mediaType);
  const active = useIsInLibrary(listType, tmdbId, listMediaType);
  const { mutate, isPending } = useToggleQuickList();

  function handleClick() {
    if (sessionLoading) return;
    if (!session?.user) {
      router.push("/login");
      return;
    }

    mutate({ listType, tmdbId, mediaType: listMediaType, title, posterPath, releaseYear });
  }

  return (
    <Button
      type="button"
      size={size}
      variant={variant}
      disabled={isPending}
      onClick={handleClick}
      className={className}
      data-active={active}
    >
      {active && activeIcon ? activeIcon : icon}
      <span className="sr-only">{active ? activeLabel ?? label : label}</span>
    </Button>
  );
}
