import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReviewCard } from "@/features/reviews/components/review-card";
import { getUserReviews } from "@/features/reviews/queries";
import { getCurrentUserId } from "@/lib/auth";

export const metadata: Metadata = { title: "My reviews | Moodflix" };

export default async function MyReviewsPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  const reviews = await getUserReviews(userId, { take: 100, includeDrafts: true }, userId);

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="font-heading text-2xl font-bold">My reviews</h1>
        <Button asChild className="gap-2">
          <Link href="/reviews/new">
            <PenLine className="size-4" /> Write a review
          </Link>
        </Button>
      </div>

      {reviews.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">You haven&apos;t written any reviews yet.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} isAuthenticated />
          ))}
        </div>
      )}
    </div>
  );
}