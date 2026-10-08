import { z } from "zod";
import { extractPlainText, type TiptapNode } from "@/utils/tiptap";

export const RATING_CRITERIA = [
  { key: "directing", label: "Directing" },
  { key: "acting", label: "Acting" },
  { key: "screenplay", label: "Screenplay" },
  { key: "visuals", label: "Visuals" },
  { key: "music", label: "Music" },
] as const;

const rating = z.number().int().min(1).max(10);
const bulletList = z.array(z.string().trim().min(1).max(80)).max(5);

export const reviewMediaSchema = z.object({
  tmdbId: z.number().int().positive(),
  mediaType: z.enum(["MOVIE", "TV"]),
  title: z.string().min(1),
  posterPath: z.string().nullable(),
  releaseYear: z.string().nullable(),
});

const contentSchema = z
  .object({ type: z.literal("doc") })
  .catchall(z.unknown())
  .refine((doc) => extractPlainText(doc as TiptapNode).length >= 50, {
    message: "Write at least 50 characters",
  });

export const reviewInputSchema = z
  .object({
    type: z.enum(["SINGLE", "LIST"]),
    title: z.string().trim().min(3, "Title is too short").max(120),
    content: contentSchema,
    hasSpoilers: z.boolean(),
    loved: bulletList,
    disliked: bulletList,
    media: z.array(reviewMediaSchema).max(50),
    overall: rating.optional(),
    directing: rating.optional(),
    acting: rating.optional(),
    screenplay: rating.optional(),
    visuals: rating.optional(),
    music: rating.optional(),
  })
  .superRefine((value, ctx) => {
    if (value.type === "SINGLE") {
      if (value.media.length !== 1) {
        ctx.addIssue({ code: "custom", path: ["media"], message: "Pick a movie or TV show" });
      }
      if (value.overall === undefined) {
        ctx.addIssue({ code: "custom", path: ["overall"], message: "Give an overall rating" });
      }
    } else if (value.media.length < 2) {
      ctx.addIssue({ code: "custom", path: ["media"], message: "A list needs at least 2 titles" });
    }
  });

export const saveReviewSchema = z.object({
  id: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  data: reviewInputSchema,
});

export const commentInputSchema = z.object({
  reviewId: z.string().min(1),
  parentId: z.string().min(1).optional(),
  body: z.string().trim().min(1, "Write something").max(1000),
});

export type ReviewInput = z.infer<typeof reviewInputSchema>;
export type ReviewMediaInput = z.infer<typeof reviewMediaSchema>;
export type CommentInput = z.infer<typeof commentInputSchema>;