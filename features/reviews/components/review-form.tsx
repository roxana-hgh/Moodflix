"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { saveReview } from "../actions";
import { RATING_CRITERIA, reviewInputSchema, type ReviewInput } from "../schema";
import { BulletListInput } from "./bullet-list-input";
import { MediaPicker } from "./media-picker";
import { RatingInput } from "./rating-input";
import { ReviewEditor } from "./review-editor";
import { toPlainJson } from "@/utils/tiptap";

interface ReviewFormProps {
  initial?: { id: string; status: "DRAFT" | "PUBLISHED"; data: ReviewInput };
}

const EMPTY_DOC: ReviewInput["content"] = { type: "doc", content: [{ type: "paragraph" }] };

function FieldError({ message }: { message?: unknown }) {
  if (typeof message !== "string" || message.length === 0) return null;
  return <p className="text-sm text-destructive">{message}</p>;
}

export function ReviewForm({ initial }: ReviewFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<ReviewInput>({
    resolver: zodResolver(reviewInputSchema),
    defaultValues: initial?.data ?? {
      type: "SINGLE",
      title: "",
      content: EMPTY_DOC,
      hasSpoilers: false,
      loved: [],
      disliked: [],
      media: [],
    },
  });

  const { control, register, setValue, watch, formState } = form;
  const type = watch("type");
  const isEditing = Boolean(initial);
  const errors = formState.errors;

  function handleTypeChange(next: ReviewInput["type"]) {
    setValue("type", next);
    setValue("media", []);
    setValue("overall", undefined);
    RATING_CRITERIA.forEach(({ key }) => setValue(key, undefined));
  }

function submit(status: "DRAFT" | "PUBLISHED") {
  void form.handleSubmit((data) => {
    startTransition(async () => {
      const result = await saveReview(toPlainJson({ id: initial?.id, status, data }));
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(status === "PUBLISHED" ? "Review published" : "Draft saved");
      router.push(`/reviews/${result.data.slug}`);
    });
  })();
}

  const isPublished = initial?.status === "PUBLISHED";

  return (
    <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-6 pb-24 lg:pb-0">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Main column */}
        <div className="flex min-w-0 flex-col gap-5">
          <Tabs value={type} onValueChange={(v) => handleTypeChange(v as ReviewInput["type"])}>
            <TabsList className="grid w-full grid-cols-2 sm:w-fit">
              <TabsTrigger value="SINGLE" disabled={isEditing}>Single title</TabsTrigger>
              <TabsTrigger value="LIST" disabled={isEditing}>List</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder={type === "SINGLE" ? "Give your review a headline" : "e.g. My 10 favorite sci-fi movies"} {...register("title")} />
            <FieldError message={errors.title?.message} />
          </div>

          <div className="flex flex-col gap-2">
            <Label>{type === "SINGLE" ? "Movie or TV show" : "Titles in your list"}</Label>
            <Controller
              name="media"
              control={control}
              render={({ field }) => (
                <MediaPicker mode={type === "SINGLE" ? "single" : "multiple"} value={field.value} onChange={field.onChange} />
              )}
            />
            <FieldError message={errors.media?.message} />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Your review</Label>
            <Controller
              name="content"
              control={control}
              render={({ field }) => <ReviewEditor value={field.value} onChange={field.onChange} />}
            />
            <FieldError message={errors.content?.message} />
          </div>
        </div>

        {/* Sidebar */}
        <aside className="flex flex-col gap-5 lg:sticky lg:top-20 lg:self-start">
          {type === "SINGLE" && (
            <section className="flex flex-col gap-4 rounded-xl border bg-card p-4">
              <h2 className="font-heading text-base font-semibold">Ratings</h2>
              <Controller
                name="overall"
                control={control}
                render={({ field }) => (
                  <RatingInput label="Overall" emphasized value={field.value} onChange={field.onChange} />
                )}
              />
              <FieldError message={errors.overall?.message} />
              <div className="flex flex-col gap-4 border-t pt-4">
                {RATING_CRITERIA.map(({ key, label }) => (
                  <Controller
                    key={key}
                    name={key}
                    control={control}
                    render={({ field }) => (
                      <RatingInput label={label} value={field.value} onChange={field.onChange} />
                    )}
                  />
                ))}
              </div>
            </section>
          )}

          <section className="flex flex-col gap-4 rounded-xl border bg-card p-4">
            <Controller
              name="loved"
              control={control}
              render={({ field }) => (
                <BulletListInput label="What I loved" placeholder="e.g. The visuals" tone="positive" items={field.value} onChange={field.onChange} />
              )}
            />
            <Controller
              name="disliked"
              control={control}
              render={({ field }) => (
                <BulletListInput label="What I didn't love" placeholder="e.g. Some pacing issues" tone="negative" items={field.value} onChange={field.onChange} />
              )}
            />
          </section>

          <section className="flex items-center justify-between gap-4 rounded-xl border bg-card p-4">
            <div>
              <Label htmlFor="spoilers">Contains spoilers</Label>
              <p className="text-xs text-muted-foreground">Readers will see a spoiler warning.</p>
            </div>
            <Controller
              name="hasSpoilers"
              control={control}
              render={({ field }) => (
                <Switch id="spoilers" checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
          </section>
        </aside>
      </div>

      {/* Actions: sticky bar on mobile */}
      <div className="fixed inset-x-0 bottom-0 z-20 flex justify-end gap-2 border-t bg-background/95 p-3 backdrop-blur lg:static lg:border-0 lg:bg-transparent lg:p-0">
        {!isPublished && (
          <Button type="button" variant="outline" disabled={isPending} onClick={() => submit("DRAFT")}>
            Save draft
          </Button>
        )}
        <Button type="button" disabled={isPending} onClick={() => submit("PUBLISHED")}>
          {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
          {isPublished ? "Update review" : "Publish"}
        </Button>
      </div>
    </form>
  );
}