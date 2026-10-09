"use client";

import { useRef } from "react";
import { EditorContent, useEditor, type JSONContent } from "@tiptap/react";
import CharacterCount from "@tiptap/extension-character-count";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import { toast } from "sonner";
import { EditorToolbar } from "./editor-toolbar";

interface ReviewEditorProps {
  value?: JSONContent;
  onChange: (value: JSONContent) => void;
}

async function uploadReviewImage(file: File): Promise<string> {
  const body = new FormData();
  body.append("file", file);

  const res = await fetch("/api/reviews/upload", { method: "POST", body });
  const payload: unknown = await res.json().catch(() => null);

  if (
    res.ok &&
    typeof payload === "object" &&
    payload !== null &&
    "url" in payload &&
    typeof payload.url === "string"
  ) {
    return payload.url;
  }

  const message =
    typeof payload === "object" &&
    payload !== null &&
    "error" in payload &&
    typeof payload.error === "string"
      ? payload.error
      : `Upload failed (${res.status})`;
  throw new Error(message);
}

export function ReviewEditor({ value, onChange }: ReviewEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false, // required for SSR in Next
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Image.configure({ HTMLAttributes: { loading: "lazy" } }),
      Placeholder.configure({ placeholder: "Write your review..." }),
      CharacterCount.configure({ limit: 20000 }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: "review-prose min-h-[320px] px-4 py-3 focus:outline-none",
      },
      handleDrop: (_view, event) => {
        const file = event.dataTransfer?.files?.[0];
        if (!file?.type.startsWith("image/")) return false;
        event.preventDefault();
        void insertImage(file);
        return true;
      },
      handlePaste: (_view, event) => {
        const file = event.clipboardData?.files?.[0];
        if (!file?.type.startsWith("image/")) return false;
        event.preventDefault();
        void insertImage(file);
        return true;
      },
    },
    onUpdate: ({ editor: current }) => onChange(current.getJSON()),
  });

  async function insertImage(file: File) {
    const toastId = toast.loading("Uploading image...");
    try {
      const src = await uploadReviewImage(file);
      editor?.chain().focus().setImage({ src }).run();
      toast.success("Image added", { id: toastId });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed", { id: toastId });
    }
  }

  if (!editor) return null;

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border bg-card">
      <EditorToolbar editor={editor} onImageClick={() => fileInputRef.current?.click()} />
      <div className="max-h-[65vh] overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void insertImage(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}