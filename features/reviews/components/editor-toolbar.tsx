"use client";

import { useEditorState, type Editor } from "@tiptap/react";
import {
  Bold,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Strikethrough,
  Undo2,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Toggle } from "@/components/ui/toggle";

interface ToolbarToggleProps {
  label: string;
  icon: LucideIcon;
  pressed: boolean;
  onPressedChange: () => void;
}

function ToolbarToggle({ label, icon: Icon, pressed, onPressedChange }: ToolbarToggleProps) {
  return (
    <Toggle
      size="sm"
      aria-label={label}
      title={label}
      pressed={pressed}
      onPressedChange={onPressedChange}
      className="shrink-0"
    >
      <Icon className="size-4" />
    </Toggle>
  );
}

interface EditorToolbarProps {
  editor: Editor;
  onImageClick: () => void;
}

export function EditorToolbar({ editor, onImageClick }: EditorToolbarProps) {
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      strike: e.isActive("strike"),
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      bullet: e.isActive("bulletList"),
      ordered: e.isActive("orderedList"),
      quote: e.isActive("blockquote"),
      link: e.isActive("link"),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });

  const chain = () => editor.chain().focus();

  function toggleLink() {
    if (editor.isActive("link")) {
      chain().unsetLink().run();
      return;
    }
    const raw = window.prompt("Link URL");
    if (!raw) return;
    const href = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    chain().extendMarkRange("link").setLink({ href }).run();
  }

  return (
    <div
      role="toolbar"
      aria-label="Text formatting"
      // className="sticky top-0 z-10 flex items-center gap-0.5 overflow-x-auto rounded-t-lg border-b bg-card/95 p-1.5 backdrop-blur"
      className="flex shrink-0 items-center gap-0.5 overflow-x-auto border-b bg-card p-1.5"
    >
      <ToolbarToggle label="Bold" icon={Bold} pressed={state.bold} onPressedChange={() => chain().toggleBold().run()} />
      <ToolbarToggle label="Italic" icon={Italic} pressed={state.italic} onPressedChange={() => chain().toggleItalic().run()} />
      <ToolbarToggle label="Strikethrough" icon={Strikethrough} pressed={state.strike} onPressedChange={() => chain().toggleStrike().run()} />
      <Separator orientation="vertical" className="mx-1 h-6" />
      <ToolbarToggle label="Heading 2" icon={Heading2} pressed={state.h2} onPressedChange={() => chain().toggleHeading({ level: 2 }).run()} />
      <ToolbarToggle label="Heading 3" icon={Heading3} pressed={state.h3} onPressedChange={() => chain().toggleHeading({ level: 3 }).run()} />
      <Separator orientation="vertical" className="mx-1 h-6" />
      <ToolbarToggle label="Bullet list" icon={List} pressed={state.bullet} onPressedChange={() => chain().toggleBulletList().run()} />
      <ToolbarToggle label="Numbered list" icon={ListOrdered} pressed={state.ordered} onPressedChange={() => chain().toggleOrderedList().run()} />
      <ToolbarToggle label="Quote" icon={Quote} pressed={state.quote} onPressedChange={() => chain().toggleBlockquote().run()} />
      <ToolbarToggle label="Link" icon={Link2} pressed={state.link} onPressedChange={toggleLink} />
      <Separator orientation="vertical" className="mx-1 h-6" />
      <Button type="button" variant="ghost" size="icon" className="size-8 shrink-0" aria-label="Insert image" title="Insert image" onClick={onImageClick}>
        <ImagePlus className="size-4" />
      </Button>
      <Button type="button" variant="ghost" size="icon" className="size-8 shrink-0" aria-label="Divider" title="Divider" onClick={() => chain().setHorizontalRule().run()}>
        <Minus className="size-4" />
      </Button>
      <div className="ml-auto flex shrink-0 items-center">
        <Button type="button" variant="ghost" size="icon" className="size-8" aria-label="Undo" disabled={!state.canUndo} onClick={() => chain().undo().run()}>
          <Undo2 className="size-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="size-8" aria-label="Redo" disabled={!state.canRedo} onClick={() => chain().redo().run()}>
          <Redo2 className="size-4" />
        </Button>
      </div>
    </div>
  );
}