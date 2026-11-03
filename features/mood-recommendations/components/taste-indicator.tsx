interface TasteIndicatorProps {
  genres: string[];
  active: boolean;
  disabled: boolean;
  onToggle: (next: boolean) => void;
}

export function TasteIndicator({ genres, active, disabled, onToggle }: TasteIndicatorProps) {
  if (genres.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
      {active ? (
        <>
          <span>Tuned to your taste:</span>
          <span className="text-foreground">{genres.join(", ")}</span>
        </>
      ) : (
        <span>Personalization is off.</span>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={active}
        onClick={() => onToggle(!active)}
        disabled={disabled}
        className="underline underline-offset-4 hover:text-foreground transition-colors disabled:opacity-40"
      >
        {active ? "Turn off" : "Turn on"}
      </button>
    </div>
  );
}