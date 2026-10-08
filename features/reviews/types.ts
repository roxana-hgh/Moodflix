import type { JSONContent } from "@tiptap/react";

export type ActionResult<T = null> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export interface ReviewMediaItem {
  tmdbId: number;
  mediaType: "MOVIE" | "TV";
  title: string;
  posterPath: string | null;
  releaseYear: string | null;
}

export interface ReviewAuthor {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export interface ReviewRatings {
  overall: number | null;
  directing: number | null;
  acting: number | null;
  screenplay: number | null;
  visuals: number | null;
  music: number | null;
}

export interface ReviewCardItem {
  id: string;
  slug: string;
  type: "SINGLE" | "LIST";
  status: "DRAFT" | "PUBLISHED";
  title: string;
  excerpt: string | null;
  coverUrl: string | null;
  hasSpoilers: boolean;
  overall: number | null;
  loved: string[];
  disliked: string[];
  publishedAt: string | null;
  author: ReviewAuthor;
  media: ReviewMediaItem[];
  likeCount: number;
  commentCount: number;
  likedByViewer: boolean;
}

export interface ReviewDetail extends ReviewCardItem {
  content: JSONContent;
  ratings: ReviewRatings;
}

export interface ReviewCommentItem {
  id: string;
  body: string;
  createdAt: string;
  author: ReviewAuthor;
  replies: ReviewCommentItem[];
}

export function mediaHref(media: Pick<ReviewMediaItem, "tmdbId" | "mediaType">): string {
  return `/${media.mediaType === "MOVIE" ? "movies" : "tv"}/${media.tmdbId}`;
}