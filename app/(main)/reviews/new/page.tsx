import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ReviewForm } from "@/features/reviews/components/review-form";
import { getCurrentUserId } from "@/lib/auth";

export const metadata: Metadata = { title: "Write a review | Moodflix" };

export default async function NewReviewPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  return (
    <div className="container mx-auto py-6">
      <h1 className="mb-6 font-heading text-2xl font-bold">Write a review</h1>
      <ReviewForm />
    </div>
  );
}