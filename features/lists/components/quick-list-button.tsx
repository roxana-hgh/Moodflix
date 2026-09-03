"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useToggleQuickList } from "../hooks";
import { toListMediaType } from "../types";

interface QuickListButtonProps {
  listType: "FAVORITE" | "WATCHLIST" | "WATCHED";
  tmdbId: number;
  mediaType: "movie" | "tv";
  title: string;
  posterPath: string | null;
  releaseYear: string | null;
  initialActive: boolean;
  icon: ReactNode;
  activeIcon?: ReactNode;
  label: string;
  activeLabel?: string;
  className?: string;
  variant?: "secondary" | "outline";
  size?: "default" | "icon";
}

export function QuickListButton({
  listType,
  tmdbId,
  mediaType,
  title,
  posterPath,
  releaseYear,
  initialActive,
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
  const [active, setActive] = useState(initialActive);
  const { mutate, isPending } = useToggleQuickList();

  function handleClick() {
    if (sessionLoading) return;
    if (!session?.user) {
      router.push("/login");
      return;
    }

    const next = !active;
    setActive(next); // optimistic

    mutate(
      { listType, tmdbId, mediaType: toListMediaType(mediaType), title, posterPath, releaseYear },
      {
        onError: () => setActive(!next),
        onSuccess: (result) => {
          if (result.success) setActive(result.data.added);
        },
      }
    );
  }

  return (
    <Button
      type="button"
      size={size}
      variant={variant}
      disabled={isPending}
      onClick={handleClick}
      className={className}
    >
      {active && activeIcon ? activeIcon : icon}
      <span className="sr-only">{active ? activeLabel ?? label : label}</span>
    </Button>
  );
}