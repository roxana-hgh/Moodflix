interface InterpretedMoodProps {
  genres: string[];
  keywordTerms: string[];
}

export function InterpretedMood({ genres, keywordTerms }: InterpretedMoodProps) {
  const terms = [...genres, ...keywordTerms];
  if (terms.length === 0) return null;

  return (
    <div
      key={terms.join("-")}
      className="flex flex-wrap items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-300"
    >
      <span className="text-sm text-muted-foreground mr-1">Reading that as</span>
      {terms.map((term) => (
        <span
          key={term}
          className="text-sm text-accent-foreground bg-accent border border-border rounded-full px-3 py-1"
        >
          {term}
        </span>
      ))}
    </div>
  );
}