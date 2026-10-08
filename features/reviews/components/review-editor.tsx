"use client";

import { useRef } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import type { JSONContent } from "@tiptap/react";
import { EditorToolbar } from "./editor-toolbar";

interface ReviewEditorProps {
  value?: JSONContent;
  onChange: (value: JSONContent) => void;
}

async function uploadReviewImage(file: File): Promise<string> {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch("/api/reviews/upload", { method: "POST", body });
  if (!res.ok) throw new Error((await res.json()).error ?? "Upload failed");
  return (await res.json()).url as string;
}

export function ReviewEditor({ value, onChange }: ReviewEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false, // لازم برای SSR در Next
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Image.configure({ HTMLAttributes: { loading: "lazy" } }),
      Placeholder.configure({ placeholder: "Write your review..." }),
      CharacterCount.configure({ limit: 20000 }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          "review-prose min-h-[320px] px-4 py-3 focus:outline-none",
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
    onUpdate: ({ editor }) => onChange(editor.getJSON()),
  });

  async function insertImage(file: File) {
    try {
      const src = await uploadReviewImage(file);
      editor?.chain().focus().setImage({ src }).run();
    } catch (e) {
      console.error(e); // اینجا toast پروژه را بگذارید
    }
  }

  if (!editor) return null;

  return (
    <div className="rounded-lg border bg-card">
      <EditorToolbar editor={editor} onImageClick={() => fileInputRef.current?.click()} />
      <EditorContent editor={editor} />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
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