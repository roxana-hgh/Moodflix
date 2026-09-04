export default function PersonLoading() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse px-4 py-8 md:px-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        <div className="mx-auto aspect-[2/3] w-40 rounded-xl bg-muted md:mx-0 md:w-56" />
        <div className="flex-1 space-y-3">
          <div className="h-8 w-2/3 rounded bg-muted" />
          <div className="h-5 w-24 rounded bg-muted" />
          <div className="h-4 w-40 rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}