"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";


interface BulletListInputProps {
  label: string;
  placeholder: string;
  items: string[];
  onChange: (items: string[]) => void;
  tone: "positive" | "negative";
  max?: number;
}

export function BulletListInput({
  label,
  placeholder,
  items,
  onChange,
  tone,
  max = 5,
}: BulletListInputProps) {
  const [draft, setDraft] = useState("");

  function add() {
    const text = draft.trim();
    if (!text || items.length >= max) return;
    onChange([...items, text]);
    setDraft("");
  }

  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          value={draft}
          maxLength={80}
          placeholder={placeholder}
          disabled={items.length >= max}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={`Add to ${label}`}
          onClick={add}
          disabled={!draft.trim() || items.length >= max}
        >
          <Plus className="size-4" />
        </Button>
      </div>

      {items.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {items.map((item, index) => (
            <li key={`${item}-${index}`} className="flex items-center gap-2 text-sm">
              <span
                className={cn(
                  "size-1.5 shrink-0 rounded-full",
                  tone === "positive" ? "bg-primary" : "bg-destructive",
                )}
              />
              <span className="min-w-0 flex-1 break-words">{item}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-6"
                aria-label={`Remove ${item}`}
                onClick={() => onChange(items.filter((_, i) => i !== index))}
              >
                <X className="size-3" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}