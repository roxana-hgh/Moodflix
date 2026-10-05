"use client";

import { useEffect, useState, useTransition, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { authClient } from "@/lib/auth-client";

import { toggleFavoriteCharacter } from "../actions";
import type { CharacterInput } from "../schema";
import { cn } from "@/lib/utils";

const VARIANT_CLASSES = {
  overlay: "size-7 bg-black/50 text-white backdrop-blur hover:bg-black/70 sm:size-8",
  inline: "size-9 border border-border text-muted-foreground hover:bg-accent hover:text-foreground",
} as const;

type Props = {
  character: CharacterInput;
  initialFavorite: boolean;
  variant?: keyof typeof VARIANT_CLASSES;
  onToggled?: (isFavorite: boolean) => void;
  className?: string;
};

export function FavoriteCharacterButton({
  character,
  initialFavorite,
  variant = "overlay",
  onToggled,
  className,
}: Props) {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [pending, startTransition] = useTransition();

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setIsFavorite(initialFavorite), [initialFavorite]);

  function handleClick(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!session) return router.push("/login");

    const next = !isFavorite;
    setIsFavorite(next); // optimistic
    startTransition(async () => {
      const res = await toggleFavoriteCharacter(character);
      if (!res.success) {
        setIsFavorite(!next);
        return;
      }
      setIsFavorite(res.data!.isFavorite);
      onToggled?.(res.data!.isFavorite);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-pressed={isFavorite}
      aria-label={isFavorite ? "Remove from favorite characters" : "Add to favorite characters"}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full transition disabled:opacity-60",
        VARIANT_CLASSES[variant],
        className,
      )}
    >
      <Heart className={cn("size-4", isFavorite && "fill-red-500 text-red-500")} />
    </button>
  );
}