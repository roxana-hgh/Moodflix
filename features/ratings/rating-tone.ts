export const SCORE_LABELS = [
  "Unwatchable", "Awful", "Bad", "Poor", "Weak", "Okay",
  "Decent", "Good", "Great", "Excellent", "Masterpiece",
] as const;

export function scoreLabel(score: number) {
  return SCORE_LABELS[Math.min(10, Math.max(0, Math.floor(score)))];
}

// Static class maps only — Tailwind JIT purges dynamically built class names.
const TONES = {
  high: { text: "text-emerald-400", fill: "bg-emerald-500", shadow: "shadow-emerald-500/50", glow: "bg-emerald-500/20" },
  mid: { text: "text-amber-400", fill: "bg-amber-500", shadow: "shadow-amber-500/50", glow: "bg-amber-500/20" },
  low: { text: "text-rose-400", fill: "bg-rose-500", shadow: "shadow-rose-500/50", glow: "bg-rose-500/20" },
  neutral: { text: "text-muted-foreground", fill: "bg-primary", shadow: "shadow-primary/50", glow: "bg-primary/15" },
} as const;

export function scoreTone(score: number | null) {
  if (score === null) return TONES.neutral;
  if (score >= 7.5) return TONES.high;
  if (score >= 5) return TONES.mid;
  return TONES.low;
}