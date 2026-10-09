import { generateHTML } from "@tiptap/html/server";
import type { JSONContent } from "@tiptap/react";
import Image from "@tiptap/extension-image";
import StarterKit from "@tiptap/starter-kit";

export function ReviewContent({ content }: { content: JSONContent }) {
  const html = generateHTML(content, [StarterKit, Image]);
  return (
    <div
      className="review-prose review-prose-article"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}