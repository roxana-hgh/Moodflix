export function FilmDivider() {
  return (
    <div className="w-full my-10" aria-hidden>
        <span className="w-full block h-px bg-border" />
      {/* {Array.from({ length: 40 }).map((_, i) => (
        <span key={i} className="size-1 rounded-full bg-border shrink-0" />
      ))} */}
    </div>
  );
}