"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { timeAgo } from "@/utils/format";
import { addReviewComment, deleteReviewComment } from "../actions";
import type { ReviewCommentItem } from "../types";

interface CommentFormProps {
  reviewId: string;
  parentId?: string;
  placeholder: string;
  onDone?: () => void;
}

function CommentForm({ reviewId, parentId, placeholder, onDone }: CommentFormProps) {
  const [body, setBody] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    startTransition(async () => {
      const result = await addReviewComment({ reviewId, parentId, body });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setBody("");
      onDone?.();
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder={placeholder} maxLength={1000} rows={parentId ? 2 : 3} />
      <div className="flex justify-end gap-2">
        {onDone && (
          <Button type="button" variant="ghost" size="sm" onClick={onDone}>
            Cancel
          </Button>
        )}
        <Button type="button" size="sm" disabled={isPending || !body.trim()} onClick={handleSubmit}>
          {isPending && <Loader2 className="mr-2 size-3.5 animate-spin" />}
          {parentId ? "Reply" : "Comment"}
        </Button>
      </div>
    </div>
  );
}

interface CommentRowProps {
  comment: ReviewCommentItem;
  reviewId: string;
  viewerId: string | null;
  reviewOwnerId: string;
  canReply: boolean;
}

function CommentRow({ comment, reviewId, viewerId, reviewOwnerId, canReply }: CommentRowProps) {
  const [replying, setReplying] = useState(false);
  const [isPending, startTransition] = useTransition();
  const canDelete = viewerId !== null && (viewerId === comment.author.id || viewerId === reviewOwnerId);

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteReviewComment(comment.id);
      if (!result.ok) toast.error(result.error);
    });
  }

  return (
    <div className="flex gap-3">
      <Avatar className="size-8 shrink-0">
        {comment.author.avatarUrl && <AvatarImage src={comment.author.avatarUrl} alt={comment.author.name} />}
        <AvatarFallback>{comment.author.name.slice(0, 1).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="truncate text-sm font-medium">{comment.author.name}</span>
          <span className="text-xs text-muted-foreground" suppressHydrationWarning>
            {timeAgo(comment.createdAt)}
          </span>
        </div>
        <p className="mt-0.5 whitespace-pre-wrap break-words text-sm">{comment.body}</p>
        <div className="mt-1 flex items-center gap-1">
          {canReply && (
            <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => setReplying((v) => !v)}>
              Reply
            </Button>
          )}
          {canDelete && (
            <Button type="button" variant="ghost" size="icon" className="size-7" aria-label="Delete comment" disabled={isPending} onClick={handleDelete}>
              <Trash2 className="size-3.5" />
            </Button>
          )}
        </div>

        {replying && (
          <div className="mt-2">
            <CommentForm reviewId={reviewId} parentId={comment.id} placeholder={`Reply to ${comment.author.name}...`} onDone={() => setReplying(false)} />
          </div>
        )}

        {comment.replies.length > 0 && (
          <div className="mt-3 flex flex-col gap-4 border-l pl-4">
            {comment.replies.map((reply) => (
              <CommentRow key={reply.id} comment={reply} reviewId={reviewId} viewerId={viewerId} reviewOwnerId={reviewOwnerId} canReply={false} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface ReviewCommentsProps {
  reviewId: string;
  reviewOwnerId: string;
  comments: ReviewCommentItem[];
  totalCount: number;
  viewerId: string | null;
}

export function ReviewComments({ reviewId, reviewOwnerId, comments, totalCount, viewerId }: ReviewCommentsProps) {
  return (
    <section id="comments" className="flex scroll-mt-24 flex-col gap-5">
      <h2 className="font-heading text-xl font-semibold">Comments ({totalCount})</h2>

      {viewerId ? (
        <CommentForm reviewId={reviewId} placeholder="Share your thoughts..." />
      ) : (
        <p className="rounded-lg border bg-card p-3 text-sm text-muted-foreground">
          <Link href="/login" className="font-medium text-primary hover:underline">Sign in</Link> to join the discussion.
        </p>
      )}

      {comments.length === 0 ? (
        <p className="py-3 text-center text-sm text-muted-foreground">No comments yet.</p>
      ) : (
        <div className="flex flex-col gap-6">
          {comments.map((comment) => (
            <CommentRow key={comment.id} comment={comment} reviewId={reviewId} viewerId={viewerId} reviewOwnerId={reviewOwnerId} canReply={viewerId !== null} />
          ))}
        </div>
      )}
    </section>
  );
}