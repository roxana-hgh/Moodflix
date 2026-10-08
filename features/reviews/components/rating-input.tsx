"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface RatingInputProps {
  label: string;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  emphasized?: boolean;
}

export function RatingInput({ label, value, onChange, emphasized = false }: RatingInputProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <Label className={cn(emphasized && "font-heading text-base")}>{label}</Label>
        <div className="flex items-center gap-1">
          <span
            className={cn(
              "tabular-nums text-sm text-muted-foreground",
              value !== undefined && "font-semibold text-primary",
              emphasized && "text-lg",
            )}
          >
            {value !== undefined ? `${value}/10` : "Not rated"}
          </span>
          {value !== undefined && !emphasized && (
            <Button type="button" variant="ghost" size="icon" className="size-6" aria-label={`Clear ${label}`} onClick={() => onChange(undefined)}>
              <X className="size-3" />
            </Button>
          )}
        </div>
      </div>
      <Slider
        aria-label={label}
        min={1}
        max={10}
        step={1}
        value={[value ?? 5]}
        onValueChange={([next]) => onChange(next)}
        className={cn(value === undefined && "opacity-50")}
      />
    </div>
  );
}