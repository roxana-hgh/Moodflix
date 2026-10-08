import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ReviewForm } from "@/features/reviews/components/review-form";
import { getReviewForEdit } from "@/features/reviews/queries";
import { getCurrentUserId } from "@/lib/auth";

export const metadata: Metadata = { title: "Edit review | Moodflix" };

interface EditReviewPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditReviewPage({ params }: EditReviewPageProps) {
  const { slug } = await params;
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  const review = await getReviewForEdit(slug, userId);
  if (!review) notFound();

  return (
    <div className="container mx-auto py-6">
      <h1 className="mb-6 font-heading text-2xl font-bold">Edit review</h1>
      <ReviewForm initial={review} />
    </div>
  );
}