"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleReviewLike } from "../actions";
import { cn } from "@/lib/utils";

interface ReviewLikeButtonProps {
  reviewId: string;
  initialLiked: boolean;
  initialCount: number;
  isAuthenticated: boolean;
}

export function ReviewLikeButton({ reviewId, initialLiked, initialCount, isAuthenticated }: ReviewLikeButtonProps) {
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [, startTransition] = useTransition();

  function handleClick() {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const previous = { liked, count };
    setLiked(!liked);
    setCount(count + (liked ? -1 : 1));

    startTransition(async () => {
      const result = await toggleReviewLike(reviewId);
      if (!result.ok) {
        setLiked(previous.liked);
        setCount(previous.count);
        return;
      }
      setLiked(result.data.liked);
      setCount(result.data.count);
    });
  }

  return (
    <Button type="button" variant="ghost" size="sm" className="gap-1.5 px-2" aria-pressed={liked} aria-label={liked ? "Unlike review" : "Like review"} onClick={handleClick}>
      <Heart className={cn("size-4", liked && "fill-rose-500 text-rose-500")} />
      <span className="tabular-nums text-sm">{count}</span>
    </Button>
  );
}